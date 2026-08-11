/**
 * The readings behind the twin pillars that flank the apse — Boaz and Jachin,
 * each crowned with one of the two library globes.
 *
 * Same four-part shape as `statueLore.ts` and `planetLore.ts` (keeper's line,
 * title, attribute chips, explanation), keyed by the pillar's `kind` in
 * `three/statues.tsx` (`MasonicPillars`).
 */

export interface PillarLore {
  name: string;
  glyph: string;
  meta: string[];
  body: string;
  talk: string;
}

export const PILLAR_LORE: Record<string, PillarLore> = {
  boaz: {
    name: 'Boaz',
    glyph: '🜃',
    meta: ['Left pillar of the porch', '“In strength”', 'The terrestrial globe', '1 Kings 7:21'],
    body:
      'One of the two bronze pillars that Hiram of Tyre cast for the porch of Solomon’s Temple, described in 1 Kings and 2 Chronicles: hollow, eighteen cubits high, crowned with chapiters of lily-work, network and rows of pomegranates. Boaz stood on the left. Its name is read as “in strength,” and its partner Jachin as “he shall establish” — spoken together the two have been construed since antiquity as a single sentence, “in strength he shall establish.” Freemasonry, which built its symbolism on the temple, kept the pair at the door of the lodge and, from the eighteenth century, set a globe atop each: the earth on one and the heavens on the other, so that a candidate passing between them passes through the whole created world. The terrestrial globe is Boaz’s — the earth, the field of labour and of works.',
    talk: '“I am strength; my brother is establishment. Read us together and we make one sentence — which is rather the point of standing us apart.”',
  },
  jachin: {
    name: 'Jachin',
    glyph: '✦',
    meta: ['Right pillar of the porch', '“He shall establish”', 'The celestial globe', '2 Chronicles 3:17'],
    body:
      'The second of Hiram’s two bronze pillars, standing to the right of the temple porch, its name read as “he shall establish” or “Yah establishes.” With Boaz it frames a threshold rather than holding up a roof — in the account the pillars are free-standing, structural only in meaning. Masonic tradition gives each a globe, and Jachin’s is the celestial: the sphere of the fixed stars and the zodiac, the Sun’s road ruled across it, the heavens a lodge takes for its true ceiling. Where the terrestrial globe on Boaz stands for the earth and its labour, the celestial stands for the reach of the study beyond it — the earth-and-heavens pairing you will find on nearly every tracing board of the period this library covers. Turn it, and you can watch the twelve signs bend along the ecliptic.',
    talk: '“Strength raises nothing on its own; I am what establishes it. And I carry the heavens, so that you remember how far the plan is meant to reach.”',
  },
};
