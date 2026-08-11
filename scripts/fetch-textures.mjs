#!/usr/bin/env node
/**
 * Pull the CC0 scan set named in src/materials/sources.json into
 * public/textures/<Category>/<material-id>/.
 *
 *   npm run textures:fetch            everything not already on disk
 *   npm run textures:fetch -- --force re-download even if present
 *   npm run textures:fetch -- wood    only ids containing "wood"
 *
 * Both sources release under CC0, so the files ship with the project with no
 * attribution obligation. Credit is given in docs/MATERIALS.md regardless.
 *
 * Nothing here is required to run the museum. Every material has a painted
 * stand-in, so a checkout that never runs this renders a fully dressed
 * building — this only upgrades surfaces to photographic scans.
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEX = join(ROOT, 'public', 'textures');
const library = JSON.parse(readFileSync(join(ROOT, 'src', 'materials', 'library.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(ROOT, 'src', 'materials', 'sources.json'), 'utf8'));

const args = process.argv.slice(2);
const force = args.includes('--force');
const filter = args.find((a) => !a.startsWith('--'));

/** where a material's folder lives: an explicit category, else its family's */
function dirFor(id) {
  const def = library.materials[id];
  if (!def) return null;
  const category = def.category ?? library.categories[def.family] ?? 'Misc';
  return join(TEX, category, id);
}

/**
 * Which Poly Haven map key feeds which of our slots, best candidate first.
 *
 * Candidates rather than one name because the library is not consistent about
 * it: most assets call their base colour `Diffuse`, but `book_pattern` ships
 * `col1`/`col2` colourways and `leather_red_02` ships `coll1`/`coll2`. Guessing
 * a single name silently produced materials with a normal map and no albedo.
 *
 * `arm` packs occlusion, roughness and metalness into R, G and B — exactly the
 * layout three.js reads for aoMap, roughnessMap and metalnessMap. One file
 * therefore fills three slots, so the separate Rough/AO files are only taken
 * when an asset publishes no ARM at all.
 */
const PH_SLOTS = {
  albedo: ['Diffuse', 'diff', 'col1', 'coll1', 'col2', 'albedo'],
  normal: ['nor_gl'],
  arm: ['arm'],
  height: ['Displacement', 'disp'],
  roughness: ['Rough'],
  ao: ['AO'],
};

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

async function fetchPolyHaven(id, { asset, res, prefer }) {
  const dir = dirFor(id);
  if (!dir) return console.warn(`  ? ${id}: no such material in library.json — skipped`);
  mkdirSync(dir, { recursive: true });

  // Ask the API what this asset actually publishes rather than assuming.
  const files = await (await fetch(`https://api.polyhaven.com/files/${asset}`)).json();
  const pick = (keys) => {
    for (const k of keys) {
      const url = files?.[k]?.[res]?.jpg?.url;
      if (url) return url;
    }
    return null;
  };

  const hasArm = Boolean(pick(PH_SLOTS.arm));
  let bytes = 0;
  const got = [];
  for (const [slot, keys] of Object.entries(PH_SLOTS)) {
    if (hasArm && (slot === 'roughness' || slot === 'ao')) continue;
    // `prefer` lets two of our materials share one Poly Haven asset by taking
    // different published colourways of it: book_pattern ships col1 and col2,
    // and the candidate order below would otherwise always hand back col1.
    const url = pick(slot === 'albedo' && prefer ? [...prefer, ...keys] : keys);
    if (!url) continue;
    const dest = join(dir, `${slot}.jpg`);
    if (!force && existsSync(dest)) {
      got.push(slot);
      continue;
    }
    bytes += await download(url, dest);
    got.push(slot);
  }
  if (!got.includes('albedo')) {
    console.warn(`  ! ${id}: polyhaven/${asset} published no base colour at ${res}`);
  }
  console.log(`  ✓ ${id}  ←  polyhaven/${asset} @${res}  [${got.join(' ')}]  (${(bytes / 1e6).toFixed(1)} MB)`);
}

/** ambientCG ships one zip per resolution; stems inside are `<id>_<res>-JPG_<Map>.jpg` */
const ACG_MAPS = {
  Color: 'albedo',
  NormalGL: 'normal',
  Roughness: 'roughness',
  Metalness: 'metalness',
  AmbientOcclusion: 'ao',
  Displacement: 'height',
};

async function fetchAmbientCG(id, { asset, res }) {
  const dir = dirFor(id);
  if (!dir) return console.warn(`  ? ${id}: no such material in library.json — skipped`);
  mkdirSync(dir, { recursive: true });
  if (!force && existsSync(join(dir, 'albedo.jpg'))) {
    return console.log(`  · ${id}  already present`);
  }
  const zip = join(dir, '_tmp.zip');
  const bytes = await download(`https://ambientcg.com/get?file=${asset}_${res}-JPG.zip`, zip);
  const stage = join(dir, '_tmp');
  execFileSync('unzip', ['-oq', zip, '-d', stage]);
  for (const file of readdirSync(stage)) {
    const suffix = file.replace(/\.jpg$/i, '').split('_').pop();
    const slot = ACG_MAPS[suffix];
    if (slot) writeFileSync(join(dir, `${slot}.jpg`), readFileSync(join(stage, file)));
  }
  rmSync(stage, { recursive: true, force: true });
  rmSync(zip, { force: true });
  console.log(`  ✓ ${id}  ←  ambientcg/${asset} @${res}  (${(bytes / 1e6).toFixed(1)} MB)`);
}

const jobs = [];
for (const [id, spec] of Object.entries(sources.polyhaven)) {
  if (!filter || id.includes(filter)) jobs.push(() => fetchPolyHaven(id, spec));
}
for (const [id, spec] of Object.entries(sources.ambientcg)) {
  if (!filter || id.includes(filter)) jobs.push(() => fetchAmbientCG(id, spec));
}

console.log(`fetching ${jobs.length} material${jobs.length === 1 ? '' : 's'}…`);

// four at a time: enough to saturate a connection, polite enough not to look
// like an attack on a free CC0 host
const LANES = 4;
const queue = jobs[Symbol.iterator]();
await Promise.all(
  Array.from({ length: LANES }, async () => {
    for (const job of queue) {
      try {
        await job();
      } catch (err) {
        console.warn(`  ! ${err.message}`);
      }
    }
  }),
);

console.log('\ndone — now run:  npm run textures:scan');
