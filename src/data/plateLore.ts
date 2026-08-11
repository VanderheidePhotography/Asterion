import type { PlanetLore } from './planetLore';
import { COSMOGRAPHY_LORE, COSMO_STATION } from './cosmographyLore';
import { GOETIA_LORE } from './goetia';
import { SEAL_LORE } from './solomonSeals';

/**
 * One index of readings for every plate the great orrery can put on its table
 * except the solar one, which keeps its own file.
 *
 * The dock does not care which chart a key came from — it takes a title, some
 * chips, a paragraph and a spoken line, and every plate's data file produces
 * exactly that shape. What the dock DOES need is the station eyebrow, because
 * a reading about Ptolemy's equant should not announce itself as "The Great
 * Orrery"; each plate claims a key prefix and names itself here.
 *
 * The prefixes are the whole convention, so keep them disjoint: a pick key is
 * routed by its prefix and nothing else.
 */

export const PLATE_LORE: Record<string, PlanetLore> = {
  ...COSMOGRAPHY_LORE,
  ...GOETIA_LORE,
  ...SEAL_LORE,
};

/** key prefix → the eyebrow the reading dock shows above the title */
export const PLATE_STATION: Record<string, string> = {
  ...COSMO_STATION,
  'circ:': 'Circulus Artis — The Circle of Art',
  'sig:': 'Clavicula — The Seals of Solomon',
};

/** the station label for a plate reading, or null if the key is a solar body */
export function plateStation(key: string): string | null {
  for (const prefix of Object.keys(PLATE_STATION))
    if (key.startsWith(prefix)) return PLATE_STATION[prefix];
  return null;
}
