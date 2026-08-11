import type { ClusterId, Entity } from './types';
import { rngFor } from './random';

export interface GraphEdge {
  a: string;
  b: string;
  kind: string;
}

export interface NodePosition {
  x: number;
  y: number;
  z: number;
}

export interface GraphLayout {
  /** constellation layout — clusters arranged as galaxies on a ring */
  byCluster: Map<string, NodePosition>;
  /** chronological layout — vertical axis follows time */
  byTime: Map<string, NodePosition>;
  edges: GraphEdge[];
  degree: Map<string, number>;
}

/** the angular order clusters take on the constellation's ring — exported so
 *  the plate that charts this layout can draw its legend at the same angles */
export const CLUSTER_ORDER: ClusterId[] = [
  'hermetica',
  'alchemy',
  'kabbalah',
  'renaissance',
  'early-modern',
  'freemasonry',
  'occult-revival',
  'scholarship',
];

/** Undirected, deduplicated edge list. Relations are directional in the data;
 *  for the constellation we draw each pair once. */
export function buildEdges(entities: Entity[]): GraphEdge[] {
  const ids = new Set(entities.map((e) => e.id));
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];
  for (const e of entities) {
    for (const r of e.relations) {
      if (!ids.has(r.target)) continue;
      const key = e.id < r.target ? `${e.id}|${r.target}` : `${r.target}|${e.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: e.id, b: r.target, kind: r.kind });
    }
  }
  return edges;
}

export function buildDegree(entities: Entity[], edges: GraphEdge[]): Map<string, number> {
  const degree = new Map<string, number>(entities.map((e) => [e.id, 0]));
  for (const { a, b } of edges) {
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  }
  return degree;
}

export function neighborsOf(id: string, edges: GraphEdge[]): string[] {
  const out: string[] = [];
  for (const e of edges) {
    if (e.a === id) out.push(e.b);
    else if (e.b === id) out.push(e.a);
  }
  return out;
}

const RING_RADIUS = 22;
const CLUSTER_SPREAD = 6.5;
const TIME_MIN = -300; // c. 300 BCE
const TIME_MAX = 2020;

function timeToY(year: number | undefined, fallback: number): number {
  if (year === undefined) return fallback;
  const clamped = Math.min(Math.max(year, TIME_MIN), TIME_MAX);
  const t = (clamped - TIME_MIN) / (TIME_MAX - TIME_MIN);
  return -13 + t * 26;
}

/**
 * Deterministic layout. Not a force simulation: with a curated graph of this
 * size, a seeded "galaxy ring" reads better, never jitters between visits,
 * and costs nothing at runtime.
 */
export function computeLayout(entities: Entity[]): GraphLayout {
  const edges = buildEdges(entities);
  const degree = buildDegree(entities, edges);
  const byCluster = new Map<string, NodePosition>();
  const byTime = new Map<string, NodePosition>();

  const clusterAngle = new Map<ClusterId, number>();
  CLUSTER_ORDER.forEach((c, i) => {
    clusterAngle.set(c, (i / CLUSTER_ORDER.length) * Math.PI * 2);
  });

  for (const e of entities) {
    const angle = clusterAngle.get(e.cluster) ?? 0;
    const cx = Math.cos(angle) * RING_RADIUS;
    const cz = Math.sin(angle) * RING_RADIUS;
    const rng = rngFor(e.id);
    // spherical jitter inside the cluster galaxy
    const u = rng() * Math.PI * 2;
    const v = Math.acos(2 * rng() - 1);
    const r = CLUSTER_SPREAD * Math.cbrt(rng());
    const jx = r * Math.sin(v) * Math.cos(u);
    const jy = r * Math.sin(v) * Math.sin(u) * 0.7;
    const jz = r * Math.cos(v);
    const pos = { x: cx + jx, y: jy, z: cz + jz };
    byCluster.set(e.id, pos);
    byTime.set(e.id, {
      x: pos.x,
      y: timeToY(e.year, pos.y),
      z: pos.z,
    });
  }

  return { byCluster, byTime, edges, degree };
}
