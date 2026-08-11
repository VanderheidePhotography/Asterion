/**
 * The Major Arcana, read through the lens of Western esoteric history — the
 * same tradition the library documents. Each card carries a genuine note on
 * how it was used or read by the currents in the collection (Hermetic,
 * Kabbalistic, Golden Dawn), plus a line of table-talk the wizards might
 * offer as they deal. Content is educational flavour, not fortune-telling.
 */
export interface TarotCard {
  num: number;
  roman: string;
  name: string;
  glyph: string;
  keyword: string;
  /** an esoteric-historical reading tied to the traditions in the library */
  meaning: string;
  /** an aside a wizard at the table might say */
  talk: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { num: 0, roman: '0', name: 'The Fool', glyph: '☒', keyword: 'the uncommitted spark',
    meaning: 'The Golden Dawn placed the Fool on the path of Aleph, the breath before creation — pure potential entering the Tree of Life.',
    talk: '“Every adept began as this one: stepping off the edge, trusting the air.”' },
  { num: 1, roman: 'I', name: 'The Magician', glyph: '☿', keyword: 'as above, so below',
    meaning: 'Mercury, Hermes, the table of four elements — the Magician is the Hermetic axiom made flesh: the will that binds heaven to earth.',
    talk: '“Note the tools before him — cup, blade, coin, wand. The whole art, in four objects.”' },
  { num: 2, roman: 'II', name: 'The High Priestess', glyph: '☽', keyword: 'the veiled book',
    meaning: 'Between the pillars Jachin and Boaz she guards the Torah of the unspoken — the Kabbalist’s hidden Shekhinah, wisdom received not reasoned.',
    talk: '“She holds the scroll half-closed. What is worth knowing is never handed over whole.”' },
  { num: 3, roman: 'III', name: 'The Empress', glyph: '♀', keyword: 'generative Venus',
    meaning: 'Venus and the sephirah Binah — the great mother in whom the abstract descends into form. Nature as the alchemist’s prima materia.',
    talk: '“The Empress is the vessel. No Stone is coaxed without her patience.”' },
  { num: 4, roman: 'IV', name: 'The Emperor', glyph: '♈', keyword: 'fixed order',
    meaning: 'Aries and Chokmah’s force made structure — the demiurgic ruler, law and boundary. To Agrippa, the governing intelligence of the sphere.',
    talk: '“Order is a scaffolding, not a prison. Even the Emperor answers to the stars.”' },
  { num: 5, roman: 'V', name: 'The Hierophant', glyph: '♉', keyword: 'the transmitted mystery',
    meaning: 'Taurus, the teacher of tradition — the outer church that carries the inner rite. Freemasonry’s lineage of initiation in a single figure.',
    talk: '“He keeps the keys, but the door is your own to walk through.”' },
  { num: 6, roman: 'VI', name: 'The Lovers', glyph: '♊', keyword: 'the chymical wedding',
    meaning: 'Gemini and the sacred marriage — Sol and Luna conjoined, the alchemical coniunctio the Rosicrucians made their central emblem.',
    talk: '“Two made one, then one made gold. The oldest recipe there is.”' },
  { num: 7, roman: 'VII', name: 'The Chariot', glyph: '♋', keyword: 'yoked opposites',
    meaning: 'Cancer, and the Merkabah — the throne-chariot of Ezekiel the mystics rode in vision. Mastery is holding two sphinxes to one road.',
    talk: '“The reins are will. Drop them and the beasts pull you apart.”' },
  { num: 8, roman: 'VIII', name: 'Strength', glyph: '♌', keyword: 'gentled force',
    meaning: 'Leo — the maiden closing the lion’s jaws. Not conquest but the alchemical taming of the fiery sulphur within.',
    talk: '“The lion is your own nature. You do not slay it; you befriend it.”' },
  { num: 9, roman: 'IX', name: 'The Hermit', glyph: '♍', keyword: 'the inward lamp',
    meaning: 'Virgo, the solitary with the lantern — the Neoplatonist ascending alone, the light of Nous carried into the dark to guide by.',
    talk: '“He lights the way for others, yet walks it by himself. Such is study.”' },
  { num: 10, roman: 'X', name: 'Wheel of Fortune', glyph: '♃', keyword: 'the turning spheres',
    meaning: 'Jupiter and the revolving heavens of Ptolemy — Fortuna’s wheel as the cyclic cosmos the astrologer-mages read for their correspondences.',
    talk: '“Fortune turns the same wheel for king and beggar. Only the grip differs.”' },
  { num: 11, roman: 'XI', name: 'Justice', glyph: '♎', keyword: 'the weighed soul',
    meaning: 'Libra — Ma’at’s scales and the balance of the Tree. Every act corrected, the Hermetic law of exact return: reap as you have sown.',
    talk: '“The blade and the scale, together. Judgement without measure is mere cruelty.”' },
  { num: 12, roman: 'XII', name: 'The Hanged Man', glyph: '♆', keyword: 'reversal for sight',
    meaning: 'Water, and Neptune — the initiate suspended, the world seen upside-down. Sacrifice of the ego the mystics called the lesser death.',
    talk: '“Hang a while. What looks like ruin is only a change of vantage.”' },
  { num: 13, roman: 'XIII', name: 'Death', glyph: '♏', keyword: 'the necessary nigredo',
    meaning: 'Scorpio — the alchemist’s blackening, the putrefaction that must precede gold. Not the end but the compost of the next beginning.',
    talk: '“Do not fear the black stage. Nothing green ever grew from clean soil.”' },
  { num: 14, roman: 'XIV', name: 'Temperance', glyph: '♐', keyword: 'the great work tempered',
    meaning: 'Sagittarius — the angel pouring between vessels, the alchemical solve et coagula. The distillation that marries fire and water without haste.',
    talk: '“Pour slowly. The Work is ruined more often by hurry than by error.”' },
  { num: 15, roman: 'XV', name: 'The Devil', glyph: '♑', keyword: 'the chains of matter',
    meaning: 'Capricorn, Baphomet as Lévi drew him — the binding to appetite and illusion. The Gnostic’s archon; the loosened chain shows it was never locked.',
    talk: '“Look — the chains hang loose about their necks. They stay by choice.”' },
  { num: 16, roman: 'XVI', name: 'The Tower', glyph: '♂', keyword: 'the lightning-struck',
    meaning: 'Mars — the fall of false structure, Babel undone. The sudden descent of the Kabbalist’s lightning-flash that shatters what was built on pride.',
    talk: '“The bolt only takes what could not stand. Mourn it, then build truer.”' },
  { num: 17, roman: 'XVII', name: 'The Star', glyph: '♒', keyword: 'the restored light',
    meaning: 'Aquarius — hope after the Tower, the waters poured back to earth. Sophia’s star, the anima mundi renewing the world after its blackening.',
    talk: '“After the fire, always the Star. The cosmos keeps no permanent night.”' },
  { num: 18, roman: 'XVIII', name: 'The Moon', glyph: '☾', keyword: 'the tided dark',
    meaning: 'Pisces — the road between the towers under a waxing moon. The astral light Lévi warned of: fertile, deceptive, the realm of dream and glamour.',
    talk: '“By moonlight even the true path looks like water. Tread, but doubt.”' },
  { num: 19, roman: 'XIX', name: 'The Sun', glyph: '☉', keyword: 'the solar gold',
    meaning: 'Sol — the accomplished rubedo, the child crowned in the alchemists’ garden. Consciousness made whole; the philosophical gold, at last.',
    talk: '“Here is the reddening. Warm your hands — the long Work has ripened.”' },
  { num: 20, roman: 'XX', name: 'Judgement', glyph: '♁', keyword: 'the roused dead',
    meaning: 'Fire and Pluto — the trumpet of resurrection, the aeon turned. The Golden Dawn read it as the summons to the higher self awakened.',
    talk: '“The horn does not raise the dead. It only wakes what was always sleeping.”' },
  { num: 21, roman: 'XXI', name: 'The World', glyph: '♄', keyword: 'the completed dance',
    meaning: 'Saturn, and the return to the One — the four living creatures at the corners, the macrocosm made whole. The end that is the door to Aleph again.',
    talk: '“The circle closes, and the Fool prepares to step off once more.”' },
];

/** the real Rider-Waite-Smith card art (1909, public domain), bundled locally */
export const cardImage = (c: TarotCard) => `/tarot/${String(c.num).padStart(2, '0')}.jpg`;

const POSITIONS = ['What lies behind', 'What stands present', 'What may unfold'] as const;
export const SPREAD_POSITIONS: readonly string[] = POSITIONS;

/** deal three distinct cards for a past/present/future spread */
export function dealSpread(rng: () => number = Math.random): TarotCard[] {
  const pool = [...MAJOR_ARCANA];
  const out: TarotCard[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
