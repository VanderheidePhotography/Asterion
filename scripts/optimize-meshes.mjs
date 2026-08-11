/**
 * Shrink the statue GLBs by compressing their GEOMETRY.
 *
 * Its sibling `optimize-models.mjs` deals with the textures inside these same
 * files, and between them they cover the two halves of a GLB. This half is the
 * vertex data: positions, normals and UVs shipped as raw float32 arrays, which
 * is roughly 24 bytes a vertex before a single byte of it has been asked to
 * justify itself. A scanned figure carries a lot of vertices.
 *
 * Two passes, in this order, because the second is what makes the first pay:
 *
 *   quantize()  — stores positions as 14-bit integers over the mesh's own
 *                 bounding box, normals as 10-bit octahedral, UVs as 12-bit.
 *                 On a 2 m statue, 14 bits is a quarter of a millimetre; the
 *                 scanner's own noise floor is coarser than that.
 *   meshopt     — then entropy-codes the result. It works on the byte planes
 *                 of the attribute stream, so it compresses quantized data far
 *                 better than floats: the high bytes of a quantized position
 *                 are nearly constant across a mesh, and that is exactly what
 *                 it is good at.
 *
 * WHY MESHOPT AND NOT DRACO. Both would compress; only one is free at runtime
 * here. drei's `useGLTF` enables the meshopt decoder BY DEFAULT and bundles it
 * (via three-stdlib), so a meshopt GLB needs no application change at all —
 * whereas its Draco path defaults to fetching a decoder from a Google CDN,
 * which this museum deliberately does not do for anything (see TextSprite on
 * fonts). Meshopt's decoder is also ~30 KB of JS against Draco's ~700 KB wasm,
 * and decodes several times faster, which matters on the phones this whole
 * pass is for.
 *
 * Idempotent: a file that already declares EXT_meshopt_compression is skipped,
 * so this can be run after adding one new statue without re-encoding the rest.
 * Originals are kept in `.asset-originals/meshes/` — gitignored, and OUTSIDE
 * `public/` so Vite never ships them.
 *
 *   node scripts/optimize-meshes.mjs          # rewrite public/models/*.glb
 *   node scripts/optimize-meshes.mjs --dry    # report only
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { quantize, reorder, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const MODELS = path.resolve('public/models');
const BACKUP = path.resolve('.asset-originals/meshes');
const DRY = process.argv.includes('--dry');

/**
 * Bits per attribute. These are the levers if a figure ever looks faceted.
 *
 * Position is the one that shows: too few bits and a smooth shoulder develops
 * terraces. 14 was chosen by the arithmetic above rather than by eye — at the
 * scale these models are shown, one quantization step is far below one screen
 * pixel from any position a visitor can stand in.
 */
const QUANT = {
  quantizePosition: 14,
  quantizeNormal: 10,
  quantizeTexcoord: 12,
  quantizeColor: 8,
  quantizeWeight: 8,
};

// the extension is declared on the Document, but the codec itself is handed to
// the IO — without `registerDependencies` writing fails deep inside the
// extension with "cannot read encodeGltfBuffer", which is the wasm module it
// was never given
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

async function optimize(file) {
  const full = path.join(MODELS, file);
  const before = fs.statSync(full).size;
  const document = await io.read(full);

  const already = document
    .getRoot()
    .listExtensionsUsed()
    .some((e) => e.extensionName === 'EXT_meshopt_compression');
  if (already) return 'already meshopt-compressed';

  await MeshoptEncoder.ready;
  await document.transform(
    // weld first: an unindexed or duplicate-heavy mesh wastes both passes,
    // and scanner output is routinely both
    weld(),
    // reorder for vertex-cache locality — this is also what lets meshopt's
    // encoder find runs to compress, so it is not only a runtime win
    reorder({ encoder: MeshoptEncoder, target: 'performance' }),
    quantize(QUANT),
  );

  document
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

  const out = await io.writeBinary(document);
  if (!DRY) {
    fs.mkdirSync(BACKUP, { recursive: true });
    const keep = path.join(BACKUP, file);
    if (!fs.existsSync(keep)) fs.copyFileSync(full, keep);
    fs.writeFileSync(full, out);
  }
  return { file, before, after: out.length };
}

const files = fs.readdirSync(MODELS).filter((f) => f.endsWith('.glb'));
let totalBefore = 0;
let totalAfter = 0;
for (const f of files) {
  let r;
  try {
    r = await optimize(f);
  } catch (err) {
    console.log(`${f.padEnd(22)} FAILED — ${err.message}`);
    continue;
  }
  if (typeof r === 'string') {
    console.log(`${f.padEnd(22)} skipped — ${r}`);
    continue;
  }
  totalBefore += r.before;
  totalAfter += r.after;
  const pct = (100 * (1 - r.after / r.before)).toFixed(0);
  console.log(
    `${r.file.padEnd(22)} ${(r.before / 1048576).toFixed(2).padStart(6)} MB → ` +
      `${(r.after / 1048576).toFixed(2).padStart(6)} MB  (−${pct}%)`,
  );
}
if (totalBefore) {
  console.log(
    `\n${DRY ? '[dry run] ' : ''}total ${(totalBefore / 1048576).toFixed(1)} MB → ` +
      `${(totalAfter / 1048576).toFixed(1)} MB  (−${(100 * (1 - totalAfter / totalBefore)).toFixed(0)}%)`,
  );
}
