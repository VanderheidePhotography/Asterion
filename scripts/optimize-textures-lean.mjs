/**
 * Build the HALF-SIZE texture set that phones load instead of the full scans.
 *
 * Its siblings shrink what everyone downloads; this one is only for devices
 * that cannot hold the full set in memory at all. An iPhone 11 was crashing
 * outright, and after the generated art was halved it got as far as rendering
 * one frame and then losing its WebGL context — Safari reclaiming GPU memory,
 * which the visitor sees as a frozen picture. The 143 scanned files are the
 * last large block: about 487 MB resident, untouched by anything that only
 * changes the pictures we paint ourselves.
 *
 * A quarter of the pixels, so about 120 MB. Written beside each original as
 * `<name>.lean.jpg` rather than into a parallel tree, so a material's folder
 * stays one place to look and the runtime swap is a suffix rather than a path
 * rewrite. `sips` does the work, as in the other asset scripts, because it
 * ships with macOS and keeps this repo free of a native image dependency.
 *
 * Idempotent: a `.lean.jpg` that is newer than its source is left alone, so
 * re-running after adding one material costs one encode, not 143.
 *
 *   node scripts/optimize-textures-lean.mjs         # write the lean set
 *   node scripts/optimize-textures-lean.mjs --dry   # report only
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve('public/textures');
const DRY = process.argv.includes('--dry');
/** JPEG quality for the lean set — these are already half size and lit dim */
const QUALITY = 60;
const SUFFIX = '.lean.jpg';

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.jpg') && !entry.name.endsWith(SUFFIX)) yield full;
  }
}

/** longest edge, read out of the JPEG header by sips rather than decoded */
function dimensions(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  });
  const w = Number(/pixelWidth: (\d+)/.exec(out)?.[1]);
  const h = Number(/pixelHeight: (\d+)/.exec(out)?.[1]);
  return Number.isFinite(w) && Number.isFinite(h) ? { w, h } : null;
}

let made = 0;
let skipped = 0;
let before = 0;
let after = 0;

for (const src of walk(ROOT)) {
  const dst = src.replace(/\.jpg$/, SUFFIX);
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= srcStat.mtimeMs) {
    skipped++;
    before += srcStat.size;
    after += fs.statSync(dst).size;
    continue;
  }
  const dim = dimensions(src);
  if (!dim) {
    console.log(`${path.relative(ROOT, src)} — could not read dimensions, skipped`);
    continue;
  }
  const target = Math.max(64, Math.round(Math.max(dim.w, dim.h) / 2));
  before += srcStat.size;
  if (DRY) {
    made++;
    continue;
  }
  execFileSync('sips', ['-Z', String(target), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY), src, '--out', dst], {
    stdio: 'ignore',
  });
  after += fs.statSync(dst).size;
  made++;
}

const mb = (b) => (b / 1048576).toFixed(1);
console.log(
  `${DRY ? '[dry run] ' : ''}${made} written, ${skipped} already current — ` +
    `${mb(before)} MB of scans → ${DRY ? '~' + mb(before / 4) : mb(after)} MB lean`,
);
