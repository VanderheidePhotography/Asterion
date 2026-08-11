/**
 * Rewrite the POOL table in grimoireArt.ts from scripts/art-manifest.json.
 *
 * The manifest is written by fetch-art-batch.py and records which file each
 * downloaded plate landed in and what it actually depicts. Keeping the table
 * generated means a caption can never drift away from the image it labels —
 * which matters here, because the caption is a factual claim about a
 * historical object.
 *
 * Entries already in the file are preserved; only new files are appended.
 * Run: node scripts/sync-art-pool.mjs
 */
import fs from 'node:fs';

const ART = 'src/features/explorer/three/grimoireArt.ts';
const src = fs.readFileSync(ART, 'utf8');
const manifest = JSON.parse(fs.readFileSync('scripts/art-manifest.json', 'utf8'));

const start = src.indexOf('const POOL:');
const end = src.indexOf('};', start) + 2;
const block = src.slice(start, end);

// what the table already lists, so a re-run is a no-op for those
const existing = new Map();
for (const m of block.matchAll(/\['(\/art\/[^']+)', '([^']*)'\]/g)) existing.set(m[1], m[2]);

const clusters = ['hermetica', 'alchemy', 'kabbalah', 'renaissance', 'early-modern', 'freemasonry', 'occult-revival', 'scholarship'];
const byCluster = Object.fromEntries(clusters.map((c) => [c, []]));

for (const [path, caption] of existing) {
  const c = clusters.find((k) => path.startsWith(`/art/pool-${k}-`));
  if (c) byCluster[c].push([path, caption]);
}
let added = 0;
for (const m of manifest) {
  const path = `/art/${m.file}`;
  if (existing.has(path)) continue;
  if (!fs.existsSync(`public${path}`)) continue;
  byCluster[m.cluster].push([path, m.caption]);
  added++;
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const num = (p) => Number(p.match(/-(\d+)\.jpg$/)?.[1] ?? 0);
const body = clusters
  .map((c) => {
    const rows = byCluster[c]
      .sort((a, b) => num(a[0]) - num(b[0]))
      .map(([p, cap]) => `    ['${p}', '${esc(cap)}'],`)
      .join('\n');
    const key = c.includes('-') ? `'${c}'` : c;
    return `  ${key}: [\n${rows}\n  ],`;
  })
  .join('\n');

const table = `const POOL: Record<ClusterId, [path: string, caption: string][]> = {\n${body}\n};`;
fs.writeFileSync(ART, src.slice(0, start) + table + src.slice(end));

console.log(`pool synced: ${added} new plates`);
for (const c of clusters) console.log(`  ${c}: ${byCluster[c].length + 4} images in rotation`);
