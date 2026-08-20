/**
 * A SECOND, SMALLER SET OF THE CARVED FIGURES, FOR PHONES.
 *
 * The third member of the family: `optimize-models.mjs` shrinks the textures
 * inside a GLB, `optimize-meshes.mjs` compresses its geometry, and both of
 * those rewrite the ONE file everybody loads. This one writes a separate
 * `.lean.glb` beside each figure and leaves the original completely alone,
 * because what it does is not lossless-ish housekeeping — it throws away three
 * quarters of the triangles, and a desktop should not be given that.
 *
 * ── why ────────────────────────────────────────────────────────────────────
 *
 * Each figure is about a megabyte: roughly half meshopt-compressed geometry at
 * 50,000 triangles, half JPEG maps at 1024². Thirteen of them stand in this
 * building, so a phone that walks the whole rotunda eventually pulls ~13 MB of
 * statuary over mobile data, and until a figure's file lands its niche holds a
 * crude procedural stand-in. The download queue (three/modelQueue.tsx) fixed
 * the ORDER those arrive in — what you are looking at now comes first instead
 * of everything finishing last together — and this halves what each one costs
 * once it is at the front of that queue.
 *
 * ── what is thrown away ────────────────────────────────────────────────────
 *
 * 50,000 triangles is scanner output. These are 4.3 m figures standing in
 * niches on the drum, never seen closer than about two metres, on a screen
 * 375 points wide: at that size a figure covers maybe 200×500 px, so it is
 * carrying roughly one triangle for every two pixels it will ever occupy. The
 * ratio below leaves ~12,000, which is still several triangles per pixel of
 * silhouette, and `error` caps how far any vertex may move as a fraction of
 * the mesh size so a profile cannot drift.
 *
 * Maps drop 1024² → 512². The same argument, and the same one the whole
 * texture budget rests on (see three/textureBudget.ts).
 *
 * ── the rule for adding a figure ───────────────────────────────────────────
 *
 * Nothing needs doing. Run the script; anything without a `.lean.glb` gets
 * one, and `leanModelPath` only rewrites a URL for a file the manifest says
 * exists — a figure with no lean twin simply serves its full model to
 * everybody, which is the behaviour before this script existed.
 *
 *   node scripts/optimize-models-lean.mjs          # write public/models/*.lean.glb
 *   node scripts/optimize-models-lean.mjs --dry    # report only
 *   node scripts/optimize-models-lean.mjs --force  # redo ones already written
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dequantize, quantize, reorder, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const MODELS = path.resolve('public/models');
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');

/** the suffix, and the manifest — both mirrored in three/textureBudget.ts */
const SUFFIX = '.lean.glb';
const MANIFEST = path.join(MODELS, 'lean-manifest.json');

/**
 * Keep a quarter of the triangles, and let no vertex move more than 1% of the
 * model's size doing it.
 *
 * `error` is the real safety rail: `ratio` is a target the simplifier is
 * allowed to miss, and it WILL miss it rather than exceed the error bound. So
 * a figure whose shape genuinely needs its triangles keeps them, and only the
 * ones carrying flat scanned filler get cut to the ratio. That is why this is
 * one setting for thirteen very different meshes rather than thirteen.
 */
const RATIO = 0.25;
const ERROR = 0.01;

/** maps at half their edge, which is a quarter of the pixels and of the bytes */
const TEXTURE_EDGE = 512;

/** below this there is nothing to win — the wizard is 20 KB and has no maps */
const FLOOR_BYTES = 200 * 1024;

const QUANT = {
  quantizePosition: 14,
  quantizeNormal: 10,
  quantizeTexcoord: 12,
  quantizeColor: 8,
  quantizeWeight: 8,
};

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

function countTris(document) {
  let tris = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      tris += ((idx ? idx.getCount() : pos ? pos.getCount() : 0) / 3) | 0;
    }
  }
  return tris;
}

async function build(file) {
  const full = path.join(MODELS, file);
  const out = path.join(MODELS, file.replace(/\.glb$/, SUFFIX));
  const before = fs.statSync(full).size;
  if (before < FLOOR_BYTES) return { skip: 'nothing to win' };
  if (fs.existsSync(out) && !FORCE) return { skip: 'already built (--force to redo)' };

  const document = await io.read(full);
  const trisBefore = countTris(document);

  await MeshoptEncoder.ready;
  await MeshoptSimplifier.ready;

  await document.transform(
    // the source is already quantized (see optimize-meshes), and the
    // simplifier needs real positions to measure error against — without this
    // it collapses a figure toward whatever the quantization grid says
    dequantize(),
    // scanner output is routinely unindexed or duplicate-heavy, and the
    // simplifier cannot collapse an edge whose two sides it cannot see are
    // the same edge
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: ERROR }),
    textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [TEXTURE_EDGE, TEXTURE_EDGE] }),
    reorder({ encoder: MeshoptEncoder, target: 'performance' }),
    quantize(QUANT),
  );

  document
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

  const bytes = await io.writeBinary(document);
  if (!DRY) fs.writeFileSync(out, bytes);
  return { before, after: bytes.length, trisBefore, trisAfter: countTris(document) };
}

const files = fs
  .readdirSync(MODELS)
  .filter((f) => f.endsWith('.glb') && !f.endsWith(SUFFIX))
  .sort();

let totalBefore = 0;
let totalAfter = 0;
for (const file of files) {
  let r;
  try {
    r = await build(file);
  } catch (err) {
    console.log(`${file.padEnd(24)} FAILED — ${err.message}`);
    continue;
  }
  if (r.skip) {
    console.log(`${file.padEnd(24)} skipped — ${r.skip}`);
    continue;
  }
  totalBefore += r.before;
  totalAfter += r.after;
  console.log(
    `${file.padEnd(24)} ${(r.before / 1048576).toFixed(2).padStart(5)} MB → ` +
      `${(r.after / 1048576).toFixed(2).padStart(5)} MB   ` +
      `${String(r.trisBefore).padStart(6)} → ${String(r.trisAfter).padStart(6)} tris`,
  );
}

/*
 * THE MANIFEST, and it is the reason this is safe to half-finish.
 *
 * The app must never ask for a `.lean.glb` that is not there: a 404 inside
 * `useGLTF` throws, Suspense does not catch it, and the whole hall goes to the
 * error boundary — one missing file would take the museum down on exactly the
 * devices this exists to help. So the runtime rewrites a URL only for a figure
 * named here, and the list is written from what is actually on disk.
 */
if (!DRY) {
  const built = fs
    .readdirSync(MODELS)
    .filter((f) => f.endsWith(SUFFIX))
    .map((f) => f.slice(0, -SUFFIX.length))
    .sort();
  fs.writeFileSync(MANIFEST, `${JSON.stringify(built, null, 2)}\n`);
  console.log(`\nlean-manifest.json — ${built.length} figures`);
}

if (totalBefore) {
  console.log(
    `\ntotal ${(totalBefore / 1048576).toFixed(1)} MB → ${(totalAfter / 1048576).toFixed(1)} MB ` +
      `(${(100 * (1 - totalAfter / totalBefore)).toFixed(0)}% off what a phone downloads)`,
  );
}
