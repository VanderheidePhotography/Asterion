/**
 * The esoteric readings behind the orrery — what the traditions in this
 * library actually said about each wandering body. One entry per body in the
 * great orrery, the Sun and the Earth included, shaped to the ReadingDock's
 * four parts: the keeper's line, the title, the attribute chips, and the
 * explanation.
 *
 * The correspondences are the standard Western ones: planetary metals and
 * days from the classical seven, sephirot from the Kabbalistic Tree as the
 * Golden Dawn fixed them, tarot trumps from the same school. Uranus and
 * Neptune sit outside the old system — telescopes found them — and their
 * entries say so rather than pretend antiquity.
 */

export interface PlanetLore {
  name: string;
  glyph: string;
  /** attribute chips: metal, day, sephirah, trump — whatever the body carries */
  meta: string[];
  /** the explanation proper */
  body: string;
  /** the line the orrery's unseen keeper speaks */
  talk: string;
}

export const PLANET_LORE: Record<string, PlanetLore> = {
  Sun: {
    name: 'Sun',
    glyph: '☉',
    meta: ['Metal: gold', 'Day: Sunday', 'Sephirah: Tiphareth', 'Trump: the Sun'],
    body:
      'Chief of the classical seven, and the goal of the Great Work. His metal is gold — the one metal that neither tarnishes nor corrodes, which is why the alchemists read it as matter in its perfected state and the making of it as a parable for the perfecting of a soul. On the Tree he is Tiphareth, beauty, the sixth sephirah at the exact centre of the diagram, where the paths converge and the higher and lower faces meet. The Hermetic and Rosicrucian schools alike set a solar figure at the heart of their symbolism, for the same reason this chart sets him at the heart of the room: he is what everything else turns around.',
    talk: '“Gold, beauty, and the centre. Whatever else the traditions in these halls dispute, they agree the light comes from here.”',
  },
  Earth: {
    name: 'Earth',
    glyph: '🜨',
    meta: ['Malkuth — the Kingdom', 'Salt of the Three Principles', 'The ground of the Work'],
    body:
      'The old cosmos put this globe at the still point and wheeled every sphere around it. The chart you are leaning over does not, and that displacement was itself an esoteric event — Bruno went to the stake in 1600 for an infinite universe of many suns, and the occult revival three centuries later was still working out what a cosmos with no centred humanity in it meant. In Kabbalah the Earth is Malkuth, the Kingdom, the tenth sephirah where all emanation finally lands; in alchemy it is salt, the fixed body that remains when spirit and soul are driven off. The Hermetica’s axiom “as above, so below” only means anything because there is a below: this ground, this globe, where the work is done.',
    talk: '“No longer the centre — and the traditions in these halls have been reckoning with what that costs ever since.”',
  },
  Mercury: {
    name: 'Mercury',
    glyph: '☿',
    meta: ['Metal: quicksilver', 'Day: Wednesday', 'Sephirah: Hod', 'Trump: the Magician'],
    body:
      'Hermes to the Greeks, Thoth to the Egyptians, and in their fusion Hermes Trismegistus — the fabled author of the Hermetica this library is named for. Mercury is the psychopomp who crosses every boundary: between gods and men, the living and the dead, matter and meaning. His metal is the only one that flows, and the alchemists made philosophical Mercury one of the three principles — the volatile spirit that must be fixed. On the Tree of Life he is Hod, splendour: intellect, language, and the sleight of hand in both.',
    talk: '“Watch the quick one. Every message in this library — every cipher, every translation — travels under his seal.”',
  },
  Venus: {
    name: 'Venus',
    glyph: '♀',
    meta: ['Metal: copper', 'Day: Friday', 'Sephirah: Netzach', 'Trump: the Empress'],
    body:
      'The morning and evening star — the same light twice named, which the mystery schools took as their first lesson in hidden unity. Her metal is copper, mirror-bright and green in corrosion, mined on her island of Cyprus. On the Tree she is Netzach, victory: desire, art, and the force that draws things together, which the magicians ranked as real a power as any of Mars’s. The rose of the Rosicrucians and the green ray of the later orders both open under her.',
    talk: '“Two risings, one star. What looks like a pair is often a single thing seen at different hours — remember that in these stacks.”',
  },
  Mars: {
    name: 'Mars',
    glyph: '♂',
    meta: ['Metal: iron', 'Day: Tuesday', 'Sephirah: Geburah', 'Trump: the Tower'],
    body:
      'The lesser malefic, the red wanderer. His metal is iron — the one metal that answers a lodestone, the one the smiths made weapons of — and in the alchemists’ furnace he is the calcining fire that burns a body to white ash so the Work can proceed. On the Tree he is Geburah, severity: the sword that prunes what mercy would let grow wild. The Golden Dawn hung the Tower on him — the lightning-struck crown, necessary ruin.',
    talk: '“Do not curse the severe one. Ask any alchemist: nothing is purified that is never burned.”',
  },
  Jupiter: {
    name: 'Jupiter',
    glyph: '♃',
    meta: ['Metal: tin', 'Day: Thursday', 'Sephirah: Chesed', 'Trump: the Wheel of Fortune'],
    body:
      'The greater benefic — the king’s planet, throned in expansion where Saturn sits in contraction. His metal is tin, which brightens every alloy it joins; his sephirah is Chesed, mercy, the open hand that gives before it measures. The astrologers of every age read him as increase, judgment tempered by generosity, and the turning of fortune’s wheel — which his trump makes explicit: what rises has been down, and will be again.',
    talk: '“The king’s star. Every tradition here that speaks of abundance, of the good year and the open hand, speaks under Jupiter.”',
  },
  Saturn: {
    name: 'Saturn',
    glyph: '♄',
    meta: ['Metal: lead', 'Day: Saturday', 'Sephirah: Binah', 'Trump: the Universe'],
    body:
      'The greater malefic and the alchemists’ dearest teacher. Outermost of the old seven, slowest, coldest — Father Time with the scythe, the reaper and the boundary. His metal is lead, and lead is where the Great Work begins: the nigredo, the blackening, gold that has forgotten itself. On the Tree he is Binah, understanding, the dark sea that gives every form its limit. The Golden Dawn gave him the final trump, the Universe — for the boundary of the old cosmos was Saturn’s sphere, and beyond it only the fixed stars.',
    talk: '“The old ones ended their cosmos here. Limit, lead, and patience — every Work in this library starts in Saturn’s shadow.”',
  },
  Uranus: {
    name: 'Uranus',
    glyph: '♅',
    meta: ['Found 1781 — Herschel', 'Modern ruler of Aquarius', 'The lightning of sudden knowing'],
    body:
      'No ancient ever saw him — Herschel’s telescope found Uranus in 1781, and the neat old cosmos of seven planets, seven metals and seven days has had a guest without a chair ever since. The astrologers of the occult revival seated him as ruler of Aquarius and read him as the lightning flash: revolution, invention, the sudden overturning of every settled order — fittingly, for a planet whose very existence overturned one. He is the moderns’ planet of the unexpected, and his discovery is itself his omen.',
    talk: '“The first planet no ancient knew. The lesson the revivalists took from him: the cosmos is not finished telling us things.”',
  },
  Neptune: {
    name: 'Neptune',
    glyph: '♆',
    meta: ['Found 1846 — by mathematics', 'Modern ruler of Pisces', 'The dissolving veil'],
    body:
      'Found in 1846 not by a wandering eye but by mathematics — Le Verrier computed where an unseen body must be, and there it was. The occultists of the revival read Neptune as the sea-god’s veil: mysticism, dream, dissolution, the boundary between self and ocean wearing thin. Modern astrology throned him over Pisces, the sign of the mystic and the martyr. If Uranus is the lightning of sudden knowing, Neptune is the fog where knowing gives way to longing — the planet of the séance age that discovered him.',
    talk: '“Summoned by arithmetic, worshipped by dreamers. No body in this orrery better suits the age that found it.”',
  },
};
