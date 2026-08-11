#!/usr/bin/env node
/**
 * Walk public/textures/ and write the manifest the material registry reads.
 *
 * Run after dropping in new scans:   npm run textures:scan
 *
 * The manifest exists so the runtime never has to guess. Without it the
 * registry would have to probe every material for every map slot on a cold
 * load — three hundred speculative requests, three hundred 404s, and the one
 * error that matters lost in the noise.
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEX_DIR = join(ROOT, 'public', 'textures');
const LIB = join(ROOT, 'src', 'materials', 'library.json');

/** filename stem → map slot. Generous, because scan packs name things a dozen ways. */
const ALIASES = {
  albedo: 'albedo',
  basecolor: 'albedo',
  base_color: 'albedo',
  color: 'albedo',
  diffuse: 'albedo',
  col: 'albedo',
  normal: 'normal',
  normalgl: 'normal',
  normal_gl: 'normal',
  nrm: 'normal',
  roughness: 'roughness',
  rough: 'roughness',
  rgh: 'roughness',
  ao: 'ao',
  ambientocclusion: 'ao',
  ambient_occlusion: 'ao',
  occlusion: 'ao',
  metalness: 'metalness',
  metallic: 'metalness',
  metal: 'metalness',
  height: 'height',
  displacement: 'height',
  disp: 'height',
  bump: 'height',
  emissive: 'emissive',
  emission: 'emissive',
  alpha: 'alpha',
  opacity: 'alpha',
  // occlusion + roughness + metalness packed into RGB — one file, three slots
  arm: 'arm',
  orm: 'arm',
};

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.ktx2', '.avif']);

if (!existsSync(TEX_DIR)) {
  console.error(`no ${TEX_DIR} — nothing to scan`);
  process.exit(0);
}

const library = JSON.parse(readFileSync(LIB, 'utf8'));
const known = new Set(Object.keys(library.materials));

const manifest = {};
const unknownDirs = [];

/** every `<Category>/<material-id>` folder under the texture root */
function* materialDirs() {
  for (const category of readdirSync(TEX_DIR)) {
    const catDir = join(TEX_DIR, category);
    if (!statSync(catDir).isDirectory()) continue;
    for (const id of readdirSync(catDir)) {
      const dir = join(catDir, id);
      if (statSync(dir).isDirectory()) yield [id, dir, category];
    }
  }
}

for (const [entry, dir, category] of materialDirs()) {
  if (!known.has(entry)) {
    unknownDirs.push(`${category}/${entry}`);
    continue;
  }

  const slots = new Set();
  const files = {};
  for (const file of readdirSync(dir)) {
    const ext = extname(file).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const stem = basename(file, ext).toLowerCase().replace(/[\s-]+/g, '_');
    // match the longest alias the stem ends with, so "oak_2k_basecolor" resolves
    const slot = ALIASES[stem] ?? Object.entries(ALIASES).find(([k]) => stem.endsWith(k))?.[1];
    if (!slot) continue;
    slots.add(slot);
    files[slot] = file;
  }
  if (slots.size === 0) continue;

  // slot → the real filename. The registry builds its URLs from this, so a
  // pack that ships `basecolor.png` where the definition guessed `albedo.jpg`
  // simply works instead of 404ing.
  manifest[entry] = Object.fromEntries([...slots].sort().map((s) => [s, files[s]]));

  // An ARM file makes any separate ao/roughness/metalness redundant — the
  // registry ignores them, so say so rather than leaving dead bytes on disk.
  if (slots.has('arm')) {
    const dead = ['ao', 'roughness', 'metalness'].filter((s) => slots.has(s));
    if (dead.length) console.warn(`  · ${entry}: ARM supersedes ${dead.join(', ')} — those files are unused`);
  }
}

writeFileSync(join(TEX_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const dressed = Object.keys(manifest).length;
console.log(`textures: ${dressed}/${known.size} materials have scans`);
for (const [id, maps] of Object.entries(manifest)) console.log(`  ${id}: ${Object.keys(maps).join(', ')}`);
for (const d of unknownDirs) console.warn(`  ? public/textures/${d} matches no material id — ignored`);
if (dressed < known.size) {
  const bare = [...known].filter((k) => !manifest[k]);
  console.log(`still on painted stand-ins: ${bare.join(', ')}`);
}
