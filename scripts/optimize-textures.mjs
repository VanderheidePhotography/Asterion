/**
 * Bring the scanned PBR texture library down to a sane GPU budget.
 *
 * The scans arrive at 2048² per map, and a material carries three or four of
 * them. A 2048² map costs ~22 MB of VRAM once mipmapped — the library as
 * shipped wanted ~1.3 GB before a single statue was loaded. Nothing in the
 * building is seen close enough to resolve 2048²: the surfaces are tiled, so
 * apparent detail comes from the `repeat` in the material registry, not from
 * the source resolution.
 *
 * Halving every edge is a 4× VRAM saving and is invisible at the distances the
 * camera actually stands. Measurement maps (arm/ao/roughness/metalness/height)
 * go smaller still — they carry low-frequency data and are never sampled for
 * a sharp edge.
 *
 *   node scripts/optimize-textures.mjs --dry
 *   node scripts/optimize-textures.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve('public/textures');
const BACKUP = path.resolve('.asset-originals/textures');
const DRY = process.argv.includes('--dry');

/** colour and normal keep the most; the measurement maps need far less */
const TARGET = { albedo: 1024, normal: 1024, emissive: 1024 };
const DEFAULT_TARGET = 512;
const QUALITY = 84;

function targetFor(file) {
  return TARGET[path.basename(file, path.extname(file))] ?? DEFAULT_TARGET;
}

function dimsOf(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  });
  const w = +(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
  const h = +(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
  return { w, h };
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p !== BACKUP) walk(p); }
    else if (/\.(jpe?g|png)$/i.test(e.name)) files.push(p);
  }
})(ROOT);

let before = 0;
let after = 0;
let vramBefore = 0;
let vramAfter = 0;
let touched = 0;

for (const file of files) {
  const size = fs.statSync(file).size;
  const { w, h } = dimsOf(file);
  const target = targetFor(file);
  before += size;
  vramBefore += w * h * 4 * 1.33;

  if (Math.max(w, h) <= target) {
    after += size;
    vramAfter += w * h * 4 * 1.33;
    continue;
  }
  const scale = target / Math.max(w, h);
  vramAfter += Math.round(w * scale) * Math.round(h * scale) * 4 * 1.33;

  if (DRY) { after += Math.round(size * scale * scale); touched++; continue; }

  const rel = path.relative(ROOT, file);
  const keep = path.join(BACKUP, rel);
  fs.mkdirSync(path.dirname(keep), { recursive: true });
  if (!fs.existsSync(keep)) fs.copyFileSync(file, keep);

  execFileSync('sips', ['-Z', String(target), file, '--out', file], { stdio: 'ignore' });
  execFileSync(
    'sips',
    ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY), file, '--out', file],
    { stdio: 'ignore' },
  );
  after += fs.statSync(file).size;
  touched++;
}

const mb = (b) => (b / 1048576).toFixed(0);
console.log(`${DRY ? '[dry run] ' : ''}${touched}/${files.length} maps resized`);
console.log(`  disk  ${mb(before)} MB → ${mb(after)} MB`);
console.log(`  VRAM  ${mb(vramBefore)} MB → ${mb(vramAfter)} MB`);
