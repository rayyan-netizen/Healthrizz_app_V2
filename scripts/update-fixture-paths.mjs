#!/usr/bin/env node
/**
 * After running extract-png-from-canva-svg.mjs, some lesson slide assets
 * are now PNGs (or JPGs) instead of SVGs. Update local-lessons.ts so each
 * `image_url` matches the actual file on disk.
 *
 * Strategy: for every `.svg` reference, check if a `.png` (or `.jpg`)
 * exists at the same lesson dir / basename. If so, swap. Otherwise leave.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FIXTURE = path.join(ROOT, 'core/learning/content/local-lessons.ts');
const LESSON_DIR = path.join(ROOT, 'assets/lessons/presentations');

// Read fixture
let src = fs.readFileSync(FIXTURE, 'utf8');

// Find all `${S<n>}/<name>.svg` patterns, plus the leading-`/` literal form.
// We need the lesson directory to disambiguate. Look for the S<n> constants
// at the top of the file:
//   const S1 = '/lessons/presentations/Splash-Springs-Lesson';
const constMatches = [...src.matchAll(/const\s+(S\d+)\s*=\s*['"]([^'"]+)['"]/g)];
const constMap = Object.fromEntries(constMatches.map((m) => [m[1], m[2]]));

let replaced = 0;
let skipped = 0;

for (const [varName, urlPrefix] of Object.entries(constMap)) {
  // urlPrefix is like '/lessons/presentations/Splash-Springs-Lesson'
  // disk dir is assets + urlPrefix
  const diskDir = path.join(ROOT, 'assets', urlPrefix);
  if (!fs.existsSync(diskDir)) continue;

  // Find every `${S<n>}/<base>.svg` in src
  const re = new RegExp(`\\$\\{${varName}\\}/([0-9A-Za-z_-]+)\\.svg`, 'g');
  src = src.replace(re, (full, base) => {
    const pngPath = path.join(diskDir, `${base}.png`);
    const jpgPath = path.join(diskDir, `${base}.jpg`);
    if (fs.existsSync(pngPath)) {
      replaced++;
      return `\${${varName}}/${base}.png`;
    }
    if (fs.existsSync(jpgPath)) {
      replaced++;
      return `\${${varName}}/${base}.jpg`;
    }
    skipped++;
    return full;
  });
}

fs.writeFileSync(FIXTURE, src);
console.log(`Replaced ${replaced} .svg references with .png/.jpg; left ${skipped} as .svg`);
