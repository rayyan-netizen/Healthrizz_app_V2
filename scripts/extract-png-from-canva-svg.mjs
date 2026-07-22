#!/usr/bin/env node
/**
 * Canva exports illustrations as "SVG" files that are 98% base64-embedded PNG.
 * For 97 lesson slides this bloats the bundle to 219MB.
 *
 * This script:
 *   1. Walks assets/lessons/presentations/<lesson>/
 *   2. For each .svg, extracts the first base64 PNG via a `data:image/png;base64,...` match
 *   3. Decodes and writes <n>.png next to the .svg
 *   4. Optimises with pngquant (70-85% quality)
 *   5. Deletes the original .svg
 *
 * After running:
 *   - Update local-lessons.ts: replace `.svg` with `.png` in slide image_urls
 *   - Run `npm run gen:assets` to rebuild slide-imports.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LESSON_DIR = path.join(ROOT, 'assets/lessons/presentations');

const DRY_RUN = process.argv.includes('--dry-run');
const KEEP_SVG = process.argv.includes('--keep-svg');
const SKIP_OPTIMIZE = process.argv.includes('--skip-optimize');

function hasPngquant() {
  try {
    execFileSync('pngquant', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

const PNGQUANT = !SKIP_OPTIMIZE && hasPngquant();
if (!SKIP_OPTIMIZE && !PNGQUANT) {
  console.warn('  WARN: pngquant not found — extracted PNGs will not be compressed.');
  console.warn('        Install with: brew install pngquant');
}

const stats = {
  files: 0,
  noMatch: 0,
  origBytes: 0,
  extractedBytes: 0,
  optimizedBytes: 0,
};

const lessons = fs.existsSync(LESSON_DIR)
  ? fs.readdirSync(LESSON_DIR).filter((f) => fs.statSync(path.join(LESSON_DIR, f)).isDirectory())
  : [];

for (const lesson of lessons) {
  const lessonDir = path.join(LESSON_DIR, lesson);
  const svgs = fs.readdirSync(lessonDir).filter((f) => f.endsWith('.svg'));
  for (const svgName of svgs) {
    const svgPath = path.join(lessonDir, svgName);
    const buf = fs.readFileSync(svgPath);
    stats.origBytes += buf.length;
    stats.files++;

    // Find the first <image ... href="data:image/(png|jpg|jpeg);base64,..." />
    const text = buf.toString('utf8');
    const m = text.match(/data:image\/(png|jpg|jpeg);base64,([A-Za-z0-9+/=]+)/);
    if (!m) {
      stats.noMatch++;
      console.log(`  skip (no embedded raster): ${path.relative(ROOT, svgPath)}`);
      continue;
    }
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const decoded = Buffer.from(m[2], 'base64');
    stats.extractedBytes += decoded.length;

    const pngName = svgName.replace(/\.svg$/, `.${ext}`);
    const pngPath = path.join(lessonDir, pngName);

    if (DRY_RUN) {
      console.log(
        `  would write: ${path.relative(ROOT, pngPath)}  ${fmtSize(buf.length)} → ${fmtSize(decoded.length)}`
      );
      continue;
    }

    fs.writeFileSync(pngPath, decoded);

    let finalSize = decoded.length;
    if (PNGQUANT && ext === 'png') {
      try {
        execFileSync(
          'pngquant',
          ['--quality=70-85', '--strip', '--ext', '.png', '--force', pngPath],
          { stdio: 'ignore' }
        );
        finalSize = fs.statSync(pngPath).size;
      } catch (e) {
        console.warn(`    pngquant failed on ${pngName}: ${e.message}`);
      }
    }
    stats.optimizedBytes += finalSize;

    if (!KEEP_SVG) {
      fs.unlinkSync(svgPath);
    }

    console.log(
      `  ${path.relative(ROOT, pngPath)}  ${fmtSize(buf.length)} → ${fmtSize(finalSize)}`
    );
  }
}

console.log('\n=== Summary ===');
console.log(`Processed:   ${stats.files} SVGs across ${lessons.length} lessons`);
console.log(`No match:    ${stats.noMatch}  (left untouched)`);
console.log(`Original:    ${fmtSize(stats.origBytes)}`);
console.log(`Extracted:   ${fmtSize(stats.extractedBytes)}`);
if (!SKIP_OPTIMIZE && PNGQUANT) {
  console.log(`Optimized:   ${fmtSize(stats.optimizedBytes)}`);
  console.log(
    `Reduction:   ${(100 - (stats.optimizedBytes * 100) / stats.origBytes).toFixed(1)}%`
  );
}
