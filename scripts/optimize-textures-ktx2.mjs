/**
 * Re-encode the scanned textures as KTX2 / ETC1S — the compressed set the GPU
 * can hold without unpacking.
 *
 * A JPEG is small on disk and enormous in memory: the browser decodes it to
 * RGBA and uploads 4 bytes per pixel, so the 143 scans cost about 487 MB of
 * VRAM at full size and ~120 MB at the half size phones load. That number is
 * why the lean set exists at all, and it is what an iPhone 11 could not hold —
 * it rendered one frame and lost its WebGL context.
 *
 * ETC1S stays compressed all the way onto the GPU: about half a byte per pixel
 * instead of four. Measured on this collection, a 1024² albedo goes from 4 MB
 * resident to ~0.7 MB WITH a full mip chain, which the JPEG never had. And the
 * upload itself gets cheaper twice over — no JPEG decode on the main thread,
 * and a compressed upload rather than 4 MB of pixels (a cold load measured 668
 * ms inside `texSubImage2D` alone).
 *
 * BOTH SETS ARE ENCODED, full and lean, so a phone still fetches half-size
 * bytes and now holds a sixth of the memory for them:
 *
 *     albedo.jpg       -> albedo.ktx2         (full scan)
 *     albedo.lean.jpg  -> albedo.lean.ktx2    (the half-size set)
 *
 * ETC1S EVERYWHERE, including normal maps, and that is a deliberate departure
 * from the usual advice. UASTC is the quality choice for normals, and measured
 * here it turned a 193 kB JPEG into a 1,095 kB file — 5.7× the download, on
 * the exact devices this exists to help. ETC1S lands the same map at 144 kB.
 * The normals in this building are worn timber, plaster and stone under candle
 * light; the block artefacts ETC1S is criticised for do not survive contact
 * with that. Normals get a higher quality level to soften the difference.
 *
 * `sips` does the JPEG→PNG decode, as in the other asset scripts, because it
 * ships with macOS and keeps this repo free of a native image dependency.
 *
 * Idempotent: a `.ktx2` newer than its source is left alone, so re-running
 * after adding one material costs one encode rather than 286.
 *
 *   node scripts/optimize-textures-ktx2.mjs         # encode what is missing
 *   node scripts/optimize-textures-ktx2.mjs --dry   # report only
 *   node scripts/optimize-textures-ktx2.mjs --force # re-encode everything
 *
 * Needs `ktx2-encoder` and `pngjs`, which are NOT dependencies of the app —
 * install them when you run it:
 *
 *   npm install --no-save ktx2-encoder pngjs
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve('public/textures');
const LIST = path.join(ROOT, 'ktx2.json');
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');

/** ETC1S quality, 1‥255. Normals carry direction rather than colour, so a
 *  block error there bends light rather than shifting a hue — they get more. */
const QUALITY = 160;
const QUALITY_NORMAL = 200;
/** encoder effort, 0‥6. 2 is the encoder's own default and encodes ~1.5 s a
 *  file; 6 spends minutes per texture to save a few percent. */
const EFFORT = 2;

const { encodeToKTX2 } = await import('ktx2-encoder');
const { PNG } = await import('pngjs');

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.jpg')) yield full;
  }
}

/** PNG bytes in, RGBA out — the decoder the encoder asks for under Node */
async function decodePng(buffer) {
  const png = PNG.sync.read(Buffer.from(buffer));
  return { width: png.width, height: png.height, data: new Uint8Array(png.data) };
}

const scratch = path.join(os.tmpdir(), 'asterion-ktx2-src.png');
let made = 0;
let skipped = 0;
let before = 0;
let after = 0;

for (const src of walk(ROOT)) {
  const dst = src.replace(/\.jpg$/, '.ktx2');
  const srcStat = fs.statSync(src);
  if (!FORCE && fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= srcStat.mtimeMs) {
    skipped++;
    continue;
  }
  const rel = path.relative(ROOT, src);
  if (DRY) {
    console.log(`would encode ${rel}`);
    made++;
    continue;
  }
  execFileSync('sips', ['-s', 'format', 'png', src, '--out', scratch], { stdio: 'ignore' });
  const isNormal = /normal/i.test(path.basename(src));
  const bytes = await encodeToKTX2(new Uint8Array(fs.readFileSync(scratch)), {
    isUASTC: false,
    qualityLevel: isNormal ? QUALITY_NORMAL : QUALITY,
    compressionLevel: EFFORT,
    mipmap: true,
    imageDecoder: decodePng,
  });
  fs.writeFileSync(dst, bytes);
  before += srcStat.size;
  after += bytes.length;
  made++;
  console.log(`${rel}  ${(srcStat.size / 1024) | 0} kB → ${(bytes.length / 1024) | 0} kB`);
}

/**
 * The index the runtime reads. `loadTexture` cannot probe the filesystem, and
 * a speculative fetch that 404s per texture is worse than the decode it is
 * trying to avoid — so the set that exists is written down here, and the
 * registry swaps extensions only for paths it finds in this list.
 */
if (!DRY) {
  const files = [...walk(ROOT)]
    .map((f) => f.replace(/\.jpg$/, '.ktx2'))
    .filter((f) => fs.existsSync(f))
    .map((f) => path.relative(ROOT, f).split(path.sep).join('/'))
    .sort();
  fs.writeFileSync(LIST, `${JSON.stringify(files, null, 0)}\n`);
  console.log(`\nktx2.json: ${files.length} files`);
}

console.log(
  `\n${made} encoded, ${skipped} already current` +
    (before ? ` — ${(before / 1048576).toFixed(1)} MB of JPEG → ${(after / 1048576).toFixed(1)} MB of KTX2 on disk` : ''),
);
if (!DRY && made) {
  console.log('VRAM is where this pays: 4 bytes per pixel becomes about half of one, mips included.');
}
