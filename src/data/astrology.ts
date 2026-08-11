/**
 * The twelve signs of the zodiac, read through the same Western esoteric
 * tradition the library documents — Ptolemy and the astrologer-mages, Agrippa's
 * correspondences, the Golden Dawn's decans, the alchemists' planetary metals.
 * Each sign carries its classical rulership and element plus a genuine note on
 * how the current read it, and a line of table-talk an astrologer at the wheel
 * might offer. Content is educational flavour, not fortune-telling.
 */
export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface ZodiacSign {
  name: string;
  glyph: string;
  dates: string;
  element: Element;
  modality: Modality;
  /** the classical (pre-modern) planetary ruler used across the collection */
  ruler: string;
  /** an esoteric-historical reading tied to the traditions in the library */
  meaning: string;
  /** an aside an astrologer at the wheel might say */
  talk: string;
}

export const ELEMENT_COLORS: Record<Element, string> = {
  Fire: '#c0503a',
  Earth: '#6f8a4a',
  Air: '#c9a24a',
  Water: '#4a7fa8',
};

export const ZODIAC: ZodiacSign[] = [
  {
    name: 'Aries', glyph: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire', modality: 'Cardinal', ruler: 'Mars',
    meaning: 'The ram opens the year at the vernal equinox — Agrippa gives it the head, the first fire, the martial spark that begins the Great Work. The Golden Dawn set its three decans under Mars, the Sun and Venus: raw will, learning restraint.',
    talk: '“You start the wheel, friend. Every alchemy needs its first heat — try not to burn the vessel.”',
  },
  {
    name: 'Taurus', glyph: '♉', dates: 'Apr 20 – May 20', element: 'Earth', modality: 'Fixed', ruler: 'Venus',
    meaning: 'The fixed earth of Venus — the alchemists’ patient prima materia, the throat that gives things voice and form. Where Aries strikes, Taurus holds; the sign of the coagula, of what will not be hurried.',
    talk: '“Fixed earth. You are the anvil, not the hammer — and the anvil outlasts the blow.”',
  },
  {
    name: 'Gemini', glyph: '♊', dates: 'May 21 – Jun 20', element: 'Air', modality: 'Mutable', ruler: 'Mercury',
    meaning: 'Mercury’s airy house — the Twins are Hermes doubled, the messenger who crosses between above and below. To the Hermeticists this is the mind that binds opposites; the caduceus, the very emblem of the art.',
    talk: '“Mercury’s own. You speak both tongues, the earthly and the starry — mind which you trust.”',
  },
  {
    name: 'Cancer', glyph: '♋', dates: 'Jun 21 – Jul 22', element: 'Water', modality: 'Cardinal', ruler: 'Moon',
    meaning: 'The Moon’s cardinal water, the solstice gate the Neoplatonists called the way souls descend into birth. The alchemists’ silver and the great mother’s tide — the vessel that holds and remembers.',
    talk: '“Ruled by the Moon, and the Moon rules the waters within. You feel the tide before it turns.”',
  },
  {
    name: 'Leo', glyph: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire', modality: 'Fixed', ruler: 'Sun',
    meaning: 'The Sun in its own throne — fixed fire, the alchemists’ gold and their reddening, the crowned child of the rubedo. The lion of Strength gentled from within; sovereignty that need not roar.',
    talk: '“The Sun’s house. You carry the gold already — the Work is only to stop hiding it.”',
  },
  {
    name: 'Virgo', glyph: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth', modality: 'Mutable', ruler: 'Mercury',
    meaning: 'Mercury in earth — the Hermit’s sign, the discerning virgin who sifts the pure from the gross. The alchemist’s careful separatio, and the patient copyist of every grimoire on these shelves.',
    talk: '“You separate the subtle from the coarse. A rare gift — the whole art is little else.”',
  },
  {
    name: 'Libra', glyph: '♎', dates: 'Sep 23 – Oct 22', element: 'Air', modality: 'Cardinal', ruler: 'Venus',
    meaning: 'Venus’s airy scales at the autumn equinox — Ma’at’s balance and the sign of Justice, where the soul is weighed. The Hermetic law of exact return made a constellation: as above, so below, held even.',
    talk: '“The scales. You seek the point of balance — remember that a still balance is not an empty one.”',
  },
  {
    name: 'Scorpio', glyph: '♏', dates: 'Oct 23 – Nov 21', element: 'Water', modality: 'Fixed', ruler: 'Mars',
    meaning: 'Fixed water under Mars — the alchemists’ nigredo, the putrefaction that must precede gold. The eagle and the serpent both; the sign of Death in the deck, which is only the compost of the next beginning.',
    talk: '“Fixed water, and Mars beneath it. You know the black stage. Nothing green grew from clean soil.”',
  },
  {
    name: 'Sagittarius', glyph: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter',
    meaning: 'Jupiter’s mutable fire — the centaur-archer aiming at heaven, Temperance’s arrow of aspiration. To the astrologer-mages the sign of the philosopher who shoots beyond the visible sphere toward the One.',
    talk: '“Jupiter’s arrow. You aim past the mark you can see — good. That is where the truth keeps.”',
  },
  {
    name: 'Capricorn', glyph: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn',
    meaning: 'Saturn’s cardinal earth at the winter solstice — the sea-goat who climbs from the depths to the peak. The World card’s sober lord; the leaden weight the alchemists must first embrace to transmute.',
    talk: '“Saturn’s mountain. You climb where others rest. Lead becomes gold only under such patience.”',
  },
  {
    name: 'Aquarius', glyph: '♒', dates: 'Jan 20 – Feb 18', element: 'Air', modality: 'Fixed', ruler: 'Saturn',
    meaning: 'Saturn’s fixed air — the Star’s water-bearer pouring the anima mundi back to earth. The Golden Dawn read here the restored light after the Tower; the reformer who carries an old fire to a new age.',
    talk: '“The water-bearer. You pour for those not yet born — a lonely charity, but the truest.”',
  },
  {
    name: 'Pisces', glyph: '♓', dates: 'Feb 19 – Mar 20', element: 'Water', modality: 'Mutable', ruler: 'Jupiter',
    meaning: 'Jupiter’s mutable water closes the wheel — the two fishes of the dissolving self, the Hanged Man’s reversal for sight. The astral sea Lévi warned of: fertile, deceptive, the threshold where one aeon melts into the next.',
    talk: '“The last sign, the great sea. All the others dissolve in you — and from you the Fool steps off again.”',
  },
];
