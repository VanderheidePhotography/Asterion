import { describe, expect, it } from 'vitest';
import { companion, sourceMap } from '../../data';

describe('the Archivist (retrieval companion)', () => {
  it('answers from the collection with citations', () => {
    const a = companion().ask('Who founded the Golden Dawn?');
    expect(a.kind).toBe('answer');
    expect(a.passages.length).toBeGreaterThan(0);
    for (const p of a.passages) {
      expect(p.sources.length).toBeGreaterThan(0);
    }
  });

  it('can never invent a reference — every citation resolves to the bibliography', () => {
    const queries = [
      'alchemy',
      'What is the Zohar?',
      'tell me about John Dee',
      'compare Ficino and Pico',
      'timeline of Rosicrucianism',
      'what should I read about tarot?',
    ];
    for (const q of queries) {
      const a = companion().ask(q);
      for (const p of a.passages) for (const s of p.sources) expect(sourceMap.has(s)).toBe(true);
      for (const r of a.readings) expect(sourceMap.has(r)).toBe(true);
    }
  });

  it('admits uncertainty instead of guessing', () => {
    const a = companion().ask('quantum blockchain recipes');
    expect(a.kind).toBe('empty');
    expect(a.confidence).toBe('low');
    expect(a.passages).toEqual([]);
  });

  it('supports comparison mode', () => {
    const a = companion().ask('compare alchemy and kabbalah');
    expect(a.kind).toBe('comparison');
    expect(a.entities).toContain('alchemy');
    expect(a.entities).toContain('kabbalah');
  });

  it('supports timeline summaries in chronological order', () => {
    const a = companion().ask('timeline of the Golden Dawn');
    expect(a.kind).toBe('timeline');
    expect(a.passages.length).toBeGreaterThan(1);
  });

  it('offers reading recommendations from the bibliography only', () => {
    const a = companion().ask('what should I read about alchemy?');
    expect(a.kind).toBe('readings');
    expect(a.readings.length).toBeGreaterThan(0);
  });

  it('always proposes follow-up questions', () => {
    const a = companion().ask('Hermes Trismegistus');
    expect(a.followUps.length).toBeGreaterThan(0);
  });
});
