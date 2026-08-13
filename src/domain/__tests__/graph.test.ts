import { describe, expect, it } from 'vitest';
import { entities, graphLayout } from '../../data';
import { buildEdges, neighborsOf } from '../graph';

describe('knowledge graph', () => {
  it('deduplicates undirected edges', () => {
    const edges = buildEdges(entities);
    const keys = new Set(edges.map((e) => (e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`)));
    expect(keys.size).toBe(edges.length);
  });

  it('positions every entity in both layouts', () => {
    for (const e of entities) {
      expect(graphLayout().byCluster.has(e.id), e.id).toBe(true);
      expect(graphLayout().byTime.has(e.id), e.id).toBe(true);
    }
  });

  it('is deterministic — same layout on every visit', () => {
    const a = graphLayout().byCluster.get('john-dee')!;
    const b = graphLayout().byCluster.get('john-dee')!;
    expect(a).toEqual(b);
    expect(Number.isFinite(a.x + a.y + a.z)).toBe(true);
  });

  it('neighbor lookup is symmetric', () => {
    const edges = graphLayout().edges;
    for (const e of entities.slice(0, 10)) {
      for (const n of neighborsOf(e.id, edges)) {
        expect(neighborsOf(n, edges)).toContain(e.id);
      }
    }
  });
});
