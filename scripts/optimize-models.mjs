/**
 * Shrink the statue GLBs by re-encoding their embedded textures.
 *
 * Every carved figure shipped from the scanner with three 4096² PNGs
 * (basecolour, normal, metallic-roughness). On disk that is ~40 MB a piece;
 * on the GPU it is ~255 MB a piece, because a texture is decompressed to
 * RGBA the moment it is uploaded — file format buys download time, RESOLUTION
 * buys VRAM. Thirteen statues put ~3.3 GB of texture on a card that has to
 * hold the building as well, and the driver starts paging.
 *
 * The figures stand on the drum piers and are never seen closer than a couple
 * of metres, so the scan resolution is far past what any pixel can show.
 * This rewrites each GLB in place (originals kept alongside) with the maps
 * resized and re-encoded as JPEG. Uses macOS `sips` so there is no image
 * dependency to install.
 *
 *   node scripts/optimize-models.mjs            # write public/models/*.glb
 *   node scripts/optimize-models.mjs --dry      # report only
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const MODELS = path.resolve('public/models');
const BACKUP = path.resolve('.asset-originals/models');
const DRY = process.argv.includes('--dry');

/** target edge per map role — normals keep a little more than the rest because
 *  that is where a stone carving's readable detail actually lives */
const TARGET = { baseColor: 1024, normal: 1024, other: 512 };
const QUALITY = { baseColor: 82, normal: 88, other: 80 };

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

function parseGlb(buf) {
  if (buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error('not a GLB');
  let off = 12;
  let json = null;
  let bin = null;
  while (off < buf.length) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === CHUNK_JSON) json = JSON.parse(data.toString('utf8'));
    else if (type === CHUNK_BIN) bin = data;
    off += 8 + len;
  }
  return { json, bin };
}

function buildGlb(json, bin) {
  const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const binPad = (4 - (bin.length % 4)) % 4;
  const jsonLen = jsonBuf.length + jsonPad;
  const binLen = bin.length + binPad;
  const total = 12 + 8 + jsonLen + 8 + binLen;
  const out = Buffer.alloc(total);
  out.writeUInt32LE(GLB_MAGIC, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(jsonLen, 12);
  out.writeUInt32LE(CHUNK_JSON, 16);
  jsonBuf.copy(out, 20);
  out.fill(0x20, 20 + jsonBuf.length, 20 + jsonLen); // JSON pads with spaces
  const binHdr = 20 + jsonLen;
  out.writeUInt32LE(binLen, binHdr);
  out.writeUInt32LE(CHUNK_BIN, binHdr + 4);
  bin.copy(out, binHdr + 8);
  return out;
}

/** which role a given image plays, so it gets the right budget */
function roleOf(json, imageIndex) {
  const texOf = (t) => (t == null ? -1 : (json.textures[t.index]?.source ?? -1));
  for (const m of json.materials ?? []) {
    const pbr = m.pbrMetallicRoughness ?? {};
    if (texOf(pbr.baseColorTexture) === imageIndex) return 'baseColor';
    if (texOf(m.normalTexture) === imageIndex) return 'normal';
  }
  return 'other';
}

/** PNG and JPEG both carry their dimensions in a fixed place near the front */
function dimensionsOf(data) {
  if (data[0] === 0x89 && data[1] === 0x50) {
    return { w: data.readUInt32BE(16), h: data.readUInt32BE(20) };
  }
  let i = 2;
  while (i < data.length - 8) {
    if (data[i] !== 0xff) { i++; continue; }
    const m = data[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: data.readUInt16BE(i + 5), w: data.readUInt16BE(i + 7) };
    }
    i += 2 + data.readUInt16BE(i + 2);
  }
  return null;
}

function reencode(data, role, tmpDir, tag) {
  const src = path.join(tmpDir, `${tag}.png`);
  const dst = path.join(tmpDir, `${tag}.jpg`);
  fs.writeFileSync(src, data);
  // sips: resample longest edge, then transcode. Two passes because sips will
  // not set JPEG quality and geometry in one reliable invocation.
  execFileSync('sips', ['-Z', String(TARGET[role]), src, '--out', src], { stdio: 'ignore' });
  execFileSync(
    'sips',
    ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY[role]), src, '--out', dst],
    { stdio: 'ignore' },
  );
  const out = fs.readFileSync(dst);
  fs.rmSync(src, { force: true });
  fs.rmSync(dst, { force: true });
  return out;
}

function optimize(file) {
  const full = path.join(MODELS, file);
  const before = fs.statSync(full).size;
  const { json, bin } = parseGlb(fs.readFileSync(full));
  if (!json.images?.length || !bin) return 'no embedded images';

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glbopt-'));
  const replacement = new Map(); // bufferView index -> new Buffer

  json.images.forEach((img, i) => {
    if (img.bufferView == null) return;
    const bv = json.bufferViews[img.bufferView];
    const data = bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
    const role = roleOf(json, i);
    // never touch a map that is already within budget: re-encoding a small
    // PNG as JPEG can come out LARGER, and `sips -Z` would upscale it first
    const dim = dimensionsOf(data);
    if (dim && Math.max(dim.w, dim.h) <= TARGET[role]) return;
    const encoded = reencode(data, role, tmpDir, `${file}-${i}`);
    if (encoded.length >= data.length) return; // no win — leave the original
    replacement.set(img.bufferView, encoded);
    img.mimeType = 'image/jpeg';
  });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (replacement.size === 0) return 'already within budget';

  // rebuild the BIN chunk: every view is copied in order, image views swapped
  // for their smaller re-encodes, and offsets rewritten as we go
  const parts = [];
  let cursor = 0;
  json.bufferViews.forEach((bv, i) => {
    const src = replacement.get(i) ?? bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
    const pad = (4 - (cursor % 4)) % 4;
    if (pad) { parts.push(Buffer.alloc(pad)); cursor += pad; }
    bv.byteOffset = cursor;
    bv.byteLength = src.length;
    parts.push(src);
    cursor += src.length;
  });
  const newBin = Buffer.concat(parts);
  json.buffers = [{ byteLength: newBin.length }];

  const out = buildGlb(json, newBin);
  if (!DRY) {
    fs.mkdirSync(BACKUP, { recursive: true });
    const keep = path.join(BACKUP, file);
    if (!fs.existsSync(keep)) fs.copyFileSync(full, keep);
    fs.writeFileSync(full, out);
  }
  return { file, before, after: out.length, images: replacement.size };
}

const files = fs.readdirSync(MODELS).filter((f) => f.endsWith('.glb'));
let totalBefore = 0;
let totalAfter = 0;
for (const f of files) {
  const r = optimize(f);
  if (typeof r === 'string') { console.log(`${f.padEnd(20)} skipped — ${r}`); continue; }
  totalBefore += r.before;
  totalAfter += r.after;
  const pct = (100 * (1 - r.after / r.before)).toFixed(0);
  console.log(
    `${r.file.padEnd(20)} ${(r.before / 1048576).toFixed(1).padStart(6)} MB → ` +
      `${(r.after / 1048576).toFixed(1).padStart(6)} MB  (−${pct}%, ${r.images} maps)`,
  );
}
console.log(
  `\n${DRY ? '[dry run] ' : ''}total ${(totalBefore / 1048576).toFixed(0)} MB → ` +
    `${(totalAfter / 1048576).toFixed(0)} MB  (−${(100 * (1 - totalAfter / totalBefore)).toFixed(0)}%)`,
);
