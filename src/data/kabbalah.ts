/**
 * The ten sephirot of the Tree of Life, read through the tradition the
 * library documents — the Zohar, Cordovero and Luria, and the scholarship of
 * Gershom Scholem. Each carries its name, its place on the Tree, a genuine
 * note on how the kabbalists read it, and a line a kabbalist at the wall
 * might offer. Educational flavour, not instruction.
 */
export interface Sephirah {
  name: string;
  hebrew: string;
  title: string;
  /** position on the wall diagram: x in [-1,1] (viewer's right = +), y in [0,1] bottom-up */
  x: number;
  y: number;
  color: string;
  meaning: string;
  talk: string;
}

export const SEPHIROT: Sephirah[] = [
  {
    name: 'Keter', hebrew: 'כתר', title: 'The Crown', x: 0, y: 1.0, color: '#f2ecdd',
    meaning: 'The first stirring of the Ein Sof — the limitless — toward creation. The Zohar calls it the most hidden of all hidden things: will before there is anything to will.',
    talk: '“Above the Crown there is only the Limitless. Do not ask what it is; even the Tree only points.”',
  },
  {
    name: 'Chokmah', hebrew: 'חכמה', title: 'Wisdom', x: 0.8, y: 0.87, color: '#c9ccd4',
    meaning: 'The flash of unformed insight, the father-principle at the head of the right pillar. Wisdom is the point before extension — the seed the whole Tree unfolds from.',
    talk: '“Wisdom arrives whole, in a flash. Understanding is the slow work of holding it.”',
  },
  {
    name: 'Binah', hebrew: 'בינה', title: 'Understanding', x: -0.8, y: 0.87, color: '#6a5a8e',
    meaning: 'The great mother at the head of the left pillar — the womb in which the flash of Chokmah is carried into form. From Binah downward, things have shape and name.',
    talk: '“The palace of the flash. Here the point becomes a river, and the river a world.”',
  },
  {
    name: 'Chesed', hebrew: 'חסד', title: 'Mercy', x: 0.8, y: 0.64, color: '#4a7fc0',
    meaning: 'Boundless giving — the open hand. The kabbalists warned that unchecked mercy dissolves all boundaries; even love must be measured against judgement.',
    talk: '“Give without measure and you drown the garden you meant to water. Hence her sister across the Tree.”',
  },
  {
    name: 'Gevurah', hebrew: 'גבורה', title: 'Severity', x: -0.8, y: 0.64, color: '#b2413c',
    meaning: 'Restraint, judgement, the drawn boundary. Lurianic teaching traces the breaking of the vessels to severity unbalanced — evil itself as mercy withheld too long.',
    talk: '“The blade is not cruelty. Without a bank, no river; without a no, no yes worth having.”',
  },
  {
    name: 'Tiferet', hebrew: 'תפארת', title: 'Beauty', x: 0, y: 0.52, color: '#d8a93f',
    meaning: 'The heart of the Tree, where mercy and severity reconcile — the sun of the middle pillar. The Zohar weds Tiferet to the Shekhinah below: heaven leaning toward earth.',
    talk: '“All the paths cross here. Beauty is what balance looks like from inside.”',
  },
  {
    name: 'Netzach', hebrew: 'נצח', title: 'Eternity', x: 0.8, y: 0.4, color: '#4e8a4a',
    meaning: 'Endurance, victory — the fire that persists. In the prophetic Kabbalah it is the wellspring of vision, passion refined into perseverance.',
    talk: '“Eternity is not stillness. It is the flame that does not tire of burning.”',
  },
  {
    name: 'Hod', hebrew: 'הוד', title: 'Splendour', x: -0.8, y: 0.4, color: '#c07a35',
    meaning: 'Form, language, the glory of structure — where the currents of the Tree are caught in words and rites. The sphere the magicians of the revival claimed for their art.',
    talk: '“Splendour gives the nameless its letters. Mind that the letters do not become a cage.”',
  },
  {
    name: 'Yesod', hebrew: 'יסוד', title: 'The Foundation', x: 0, y: 0.28, color: '#8a5ec0',
    meaning: 'The channel through which all the upper lights pour toward the world — the treasury of images, which the kabbalists likened to the moon reflecting the sun of Tiferet.',
    talk: '“Everything above must pass this narrow bridge to reach you. Dreams live here.”',
  },
  {
    name: 'Malkuth', hebrew: 'מלכות', title: 'The Kingdom', x: 0, y: 0.08, color: '#7a5a38',
    meaning: 'The world itself — and the Shekhinah, the indwelling presence in exile within it. The Tree ends where you stand; the kabbalist’s work is to raise sparks from here.',
    talk: '“You are standing in the tenth sephirah. The exile ends one gathered spark at a time.”',
  },
];

/** the 22 paths of the Tree (indices into SEPHIROT), after the familiar arrangement */
export const TREE_PATHS: [number, number][] = [
  [0, 1], [0, 2], [0, 5], [1, 2], [1, 5], [1, 3], [2, 5], [2, 4],
  [3, 4], [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8],
  [6, 7], [6, 8], [6, 9], [7, 8], [7, 9], [8, 9],
];
