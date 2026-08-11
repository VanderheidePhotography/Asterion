import type { Entity, EraId } from './types';
import { ERA_META } from './types';

export interface TimelineItem {
  entity: Entity;
  year: number;
}

/** Anything dated and event-like belongs on the corridor: events, imprints, foundings. */
export function timelineItems(entities: Entity[]): TimelineItem[] {
  return entities
    .filter(
      (e): e is Entity & { year: number } =>
        e.year !== undefined && (e.type === 'event' || e.type === 'work' || e.type === 'organization'),
    )
    .map((entity) => ({ entity, year: entity.year }))
    .sort((a, b) => a.year - b.year);
}

export function formatYear(year: number): string {
  return year < 0 ? `${-year} BCE` : `${year}`;
}

export function groupByEra(items: TimelineItem[]): { era: EraId; items: TimelineItem[] }[] {
  const eras = new Map<EraId, TimelineItem[]>();
  for (const item of items) {
    const era = item.entity.era;
    if (!eras.has(era)) eras.set(era, []);
    eras.get(era)!.push(item);
  }
  return [...eras.entries()]
    .sort((a, b) => ERA_META[a[0]].order - ERA_META[b[0]].order)
    .map(([era, its]) => ({ era, items: its }));
}
