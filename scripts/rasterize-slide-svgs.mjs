#!/usr/bin/env node
/**
 * Rasterize Canva-exported SVG slides to flat compressed PNGs.
 *
 * Earlier we tried extracting the FIRST embedded base64 PNG inside each SVG —
 * but Canva slides have multiple raster pieces plus vector text, so that
 * approach loses content. This script uses `rsvg-convert` to render the
 * COMPLETE SVG (vector + raster) into a flat PNG, then `pngquant` to compress.
 *
 * Pipeline:
 *   1. Walk assets/lessons/presentations/<lesson>/*.svg
 *   2. For each SVG, render to PNG via rsvg-convert at 1440x810 (slightly
 *      below 1080p — kids' phones don't need full 4K, saves ~30%)
 *   3. Compress with pngquant (70-85% quality)
 *   4. Delete original SVG (keep with --keep-svg)
 *
 * Skips SVGs without embedded raster (those tend to be tiny vector-only
 * cards that don't benefit from rasterization).
 *
 * Args:
 *   --dry-run       print actions without writing
 *   --keep-svg      don't delete originals
 *   --skip-optimize don't run pngquant
 *   --width=N       render width in px (default 1440)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
// Rasterize SVGs in any of these dirs. Each contains lesson-named or
// recipe-named subdirs holding the actual SVGs.
const TARGET_DIRS = [
  path.join(ROOT, 'assets/lessons/presentations'),
  path.join(ROOT, 'assets/recipes/island recipies'),
];

const DRY_RUN = process.argv.includes('--dry-run');
const KEEP_SVG = process.argv.includes('--keep-svg');
const SKIP_OPTIMIZE = process.argv.includes('--skip-optimize');
const WIDTH = (() => {
  const m = process.argv.find((a) => a.startsWith('--width='));
  return m ? parseInt(m.split('=')[1], 10) : 1440;
})();

function which(cmd) {
  try {
    execFileSync(cmd, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const HAS_RSVG = which('rsvg-convert');
const HAS_PNGQUANT = which('pngquant');

if (!HAS_RSVG) {
  console.error('FATAL: rsvg-convert not found. Install: brew install librsvg');
  process.exit(1);
}
if (!SKIP_OPTIMIZE && !HAS_PNGQUANT) {
  console.warn('WARN: pngquant not found — output will not be compressed.');
}

function fmtSize(b) {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}K`;
  return `${(b / (1024 * 1024)).toFixed(1)}M`;
}

function hasEmbeddedRaster(svgPath) {
  const size = fs.statSync(svgPath).size;
  // Heuristic: any "SVG" >= 200KB is virtually always Canva-with-raster.
  // True vector-only SVGs from Canva are typically <100KB.
  if (size >= 200 * 1024) return true;
  // For smaller files, scan the full content.
  const buf = fs.readFileSync(svgPath, 'utf8');
  return /data:image\/(png|jpe?g);base64,/.test(buf);
}

const stats = { files: 0, skipped: 0, origBytes: 0, finalBytes: 0 };

// Each TARGET_DIR may contain SVGs directly OR per-lesson subdirs.
const targets = [];
for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      targets.push(full);
    } else if (entry.endsWith('.svg')) {
      // SVGs sitting directly in the target dir
      targets.push(dir);
      break;
    }
  }
}

const seenDirs = new Set();
for (const lessonDir of targets) {
  if (seenDirs.has(lessonDir)) continue;
  seenDirs.add(lessonDir);
  const svgs = fs.readdirSync(lessonDir).filter((f) => f.endsWith('.svg'));
  for (const svgName of svgs) {
    const svgPath = path.join(lessonDir, svgName);
    const orig = fs.statSync(svgPath).size;
    stats.origBytes += orig;
    stats.files++;

    if (!hasEmbeddedRaster(svgPath)) {
      stats.skipped++;
      stats.finalBytes += orig;
      console.log(`  keep-svg (vector only): ${path.relative(ROOT, svgPath)} ${fmtSize(orig)}`);
      continue;
    }

    const pngName = svgName.replace(/\.svg$/i, '.png');
    const pngPath = path.join(lessonDir, pngName);

    if (DRY_RUN) {
      console.log(`  would rasterize: ${path.relative(ROOT, svgPath)} → ${pngName}`);
      continue;
    }

    try {
      execFileSync('rsvg-convert', [
        '-w', String(WIDTH),
        '-o', pngPath,
        svgPath,
      ], { stdio: 'ignore' });
    } catch (e) {
      console.warn(`  rsvg failed on ${svgName}: ${e.message}`);
      stats.finalBytes += orig;
      continue;
    }

    let finalSize = fs.statSync(pngPath).size;
    if (HAS_PNGQUANT && !SKIP_OPTIMIZE) {
      try {
        execFileSync('pngquant', [
          '--quality=70-85', '--strip',
          '--ext', '.png', '--force',
          pngPath,
        ], { stdio: 'ignore' });
        finalSize = fs.statSync(pngPath).size;
      } catch (e) {
        console.warn(`  pngquant failed on ${pngName}: ${e.message}`);
      }
    }
    stats.finalBytes += finalSize;

    if (!KEEP_SVG) fs.unlinkSync(svgPath);
    console.log(
      `  ${path.relative(ROOT, pngPath)}  ${fmtSize(orig)} → ${fmtSize(finalSize)}`
    );
  }
}

console.log('\n=== Summary ===');
console.log(`Files:      ${stats.files} SVGs across ${seenDirs.size} dirs`);
console.log(`Vector-only (kept): ${stats.skipped}`);
console.log(`Rasterized: ${stats.files - stats.skipped}`);
console.log(`Original:   ${fmtSize(stats.origBytes)}`);
console.log(`Final:      ${fmtSize(stats.finalBytes)}`);
console.log(
  `Reduction:  ${(100 - (stats.finalBytes * 100) / stats.origBytes).toFixed(1)}%`
);
