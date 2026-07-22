// Generates core/learning/content/slide-imports.ts mapping web image_url
// paths to bundled require()/import handles, so the lesson player can
// render the same artwork that the web app uses.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LESSON_DIR = path.join(ROOT, 'assets/lessons/presentations');
const RECIPE_DIR = path.join(ROOT, 'assets/recipes/island recipies');

function listAssetsRecursive(rootDir, urlPrefix) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const sub = path.join(rootDir, entry.name);
      for (const file of fs.readdirSync(sub)) {
        if (file.endsWith('.svg') || file.endsWith('.png')) {
          const webUrl = `${urlPrefix}/${entry.name}/${file}`;
          const relFromAssets = path.relative(path.join(ROOT, 'assets'), path.join(sub, file));
          out.push({ webUrl, localPath: `@assets/${relFromAssets}` });
        }
      }
    } else if (entry.name.endsWith('.svg') || entry.name.endsWith('.png')) {
      const webUrl = `${urlPrefix}/${entry.name}`;
      const relFromAssets = path.relative(path.join(ROOT, 'assets'), path.join(rootDir, entry.name));
      out.push({ webUrl, localPath: `@assets/${relFromAssets}` });
    }
  }
  return out;
}

const lessonItems = listAssetsRecursive(LESSON_DIR, '/lessons/presentations');
const recipeItems = listAssetsRecursive(RECIPE_DIR, '/recipes/island recipies');
const items = [...lessonItems, ...recipeItems];

let body = '';
body += '/**\n';
body += ' * AUTO-GENERATED — do not edit by hand.\n';
body += ' * Regenerate via `npm run gen:assets`.\n';
body += ' * Maps web image_url strings to bundled require() handles.\n';
body += ' */\n\n';
body += "import React from 'react';\n\n";

const records = items.map((it, i) => {
  const isSvg = it.localPath.endsWith('.svg');
  const varName = isSvg ? `Svg${i}` : `Png${i}`;
  return { ...it, isSvg, varName };
});

records.forEach((it) => {
  if (it.isSvg) {
    body += `import ${it.varName} from '${it.localPath}';\n`;
  } else {
    body += `const ${it.varName} = require('${it.localPath}');\n`;
  }
});

body += '\n';
body += "export type LessonAsset = { kind: 'svg'; component: React.FC<any> } | { kind: 'png'; source: number };\n\n";
body += 'export const ASSET_MAP: Record<string, LessonAsset> = {\n';
records.forEach((it) => {
  if (it.isSvg) {
    body += `  ${JSON.stringify(it.webUrl)}: { kind: 'svg', component: ${it.varName} },\n`;
  } else {
    body += `  ${JSON.stringify(it.webUrl)}: { kind: 'png', source: ${it.varName} },\n`;
  }
});
body += '};\n\n';
body += 'export function resolveAsset(webUrl: string | null | undefined): LessonAsset | null {\n';
body += '  if (!webUrl) return null;\n';
body += '  // Direct hit (most common path).\n';
body += '  const direct = ASSET_MAP[webUrl];\n';
body += '  if (direct) return direct;\n';
body += '  // Extension fallback: a Canva SVG export may have been replaced by\n';
body += '  // a compressed .png/.jpg in the bundle while the fixture URL still\n';
body += '  // points to .svg (or vice-versa). Try common extension swaps.\n';
body += "  const swaps = ['.png', '.jpg', '.svg'];\n";
body += '  for (const ext of swaps) {\n';
body += "    const swapped: string = webUrl.replace(/\\.(svg|png|jpg|jpeg)$/i, ext);\n";
body += '    if (swapped !== webUrl && ASSET_MAP[swapped]) return ASSET_MAP[swapped];\n';
body += '  }\n';
body += '  return null;\n';
body += '}\n';

const outPath = path.join(ROOT, 'core/learning/content/slide-imports.ts');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, body);
console.log(`Wrote ${records.length} entries to core/learning/content/slide-imports.ts`);
