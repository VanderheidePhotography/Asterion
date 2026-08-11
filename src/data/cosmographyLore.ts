/**
 * The readings behind the orrery's OTHER two charts.
 *
 * The Great Orrery's table is an instrument that shows three world-models, and a
 * visitor changes the plate with the brass selector on the rim: the Copernican
 * system (data/planetLore.ts), the earth grid drawn on a flat-earth map, and the
 * Giza plateau under Orion. This file carries the readings for the last two —
 * the same four-part shape the ReadingDock expects, so they slot straight into
 * the orrery's existing pick → dock flow.
 *
 * As with the planet readings, the tone is educational esoteric-history: what the
 * traditions and the modern alternative-archaeologists actually claimed, dated
 * and attributed, not endorsed as fact. These are contested ideas and the
 * readings say so — usually by giving the claim its best case first and then the
 * answer to it, because a claim explained badly cannot be judged at all.
 *
 * Two matters of care. The Great Zimbabwe entry has to name the racist history of
 * the "someone else built it" argument, because that argument is the ancestor of
 * a good deal of what the rest of this chart is about. And the Giza readings have
 * to keep two quite different things called "the Enochian pyramid" apart: the
 * medieval legend that Enoch raised the Great Pyramid before the Flood, and the
 * Golden Dawn's truncated pyramid of the Enochian squares, which has nothing to
 * do with Egypt except its borrowed god-forms.
 */

import type { PlanetLore } from './planetLore';

/** which of the two non-solar charts a reading belongs to — drives the dock's
 *  station eyebrow, since these are not "The Great Orrery" proper */
export const COSMO_STATION: Record<string, string> = {
  'grid:': 'The Earth Grid',
  'giza:': 'Giza & the Belt of Orion',
};

/** the station label for a cosmography pick key, or null if it is a planet */
export function cosmoStation(key: string): string | null {
  for (const prefix of Object.keys(COSMO_STATION))
    if (key.startsWith(prefix)) return COSMO_STATION[prefix];
  return null;
}

export const COSMOGRAPHY_LORE: Record<string, PlanetLore> = {
  /* ————— the earth grid: the figures ————— */
  'grid:world': {
    name: 'The Planetary Lattice',
    glyph: '⊕',
    meta: ['Watkins, 1921', 'Goncharov, Morozov & Makarov, 1973', 'Becker & Hagens'],
    body:
      'That the sacred sites of the ancient world stand not at random but along straight tracks was named in England in 1921, when Alfred Watkins looked out over the Herefordshire hills and saw mounds, standing stones, moats and old churches falling into alignment. His word for the network was leys, and The Old Straight Track (1925) gave it to the century. Older cultures had said something like it long before: Chinese geomancers read lung mei, the veins of the dragon, and would not raise a house or a grave across them. The lattice ruled on this chart is the twentieth century going global with the idea. In 1973 the artist Nikolai Goncharov and the engineers Vyacheslav Morozov and Valery Makarov published “Is the Earth a Giant Crystal?” in the Soviet science monthly Khimiya i Zhizn, proposing that the planet carries an icosahedron-dodecahedron lattice, and anchoring it at the two poles and at the Great Pyramid. Bill Becker and Bethe Hagens took it up in the 1980s and subdivided it into the sixty-two-point figure now simply called the grid. The anchoring is worth watching being done: an icosahedron with a vertex at each pole has its other ten in two rings of five at 26°34′, and turning the solid until one northern vertex reaches 31.2° east brings it within four degrees of Giza. Every claim the grid makes hangs on that one rotation. The standing objection is old and not easily got round: given enough candidate sites, a straight line — or a lattice with sixty-two nodes and thirty edges — can be laid so that something important is always near something.',
    talk: '“Twelve points, thirty edges, and the whole earth to hang them on. Turn the solid until a corner touches Giza and see how much else it seems to catch. Then ask what would have to be true for it to catch nothing.”',
  },
  'grid:alison': {
    name: 'The Great Circle',
    glyph: '◯',
    meta: ['Jim Alison', 'Pole at 59°53′N 138°36′W', 'Sixteen sites within a degree'],
    body:
      'The gold ring on this chart is one great circle, and it is the most disciplined claim in the whole subject. Jim Alison noticed that Giza, Siwa, Tassili n’Ajjer, Paratoari, Ollantaytambo, Machu Picchu, Nazca, Easter Island, Aneityum, Preah Vihear, Sukhothai, Pyay, Khajuraho, Mohenjo-Daro, Persepolis, Ur and Petra all fall on or within a degree of a single circle around the earth — a circle whose pole sits at 59°53′ north, 138°36′ west, off the Alaskan coast. The angular spacings are the part that makes people sit up: Ollantaytambo is 108° along the circle from Giza, Angkor about 72°, and Easter Island falls very nearly equidistant from Angkor one way and Giza the other. This chart draws the circle FROM ITS POLE rather than fitting a curve to the sites, so what you are looking at is the claim and not a flattering summary of it. Against it: a great circle 90° from a pole at 60° north can never leave the band between 30° north and 30° south, which is the belt of the world’s deserts and monsoon river valleys — the belt where monumental civilisation happened and where stone survives. Draw enough great circles through that band and some will be crowded. What no critic has quite managed is to make the crowding on THIS one look ordinary.',
    talk: '“One ring, sixteen ruins, and none of them within a thousand miles of the next. Either they knew the size and shape of the earth, or the earth’s good building land is narrower than we like to admit. I have never settled which.”',
  },
  'grid:pole': {
    name: 'The Pole',
    glyph: '✳',
    meta: ['The centre of the sheet', 'Meru & Hyperborea', 'Where the projection is true'],
    body:
      'Every map has a place where it does not lie, and on this one it is the middle. An azimuthal equidistant projection holds true distance and true bearing from its centre and from nowhere else, so the pole here is not merely the hub of a design — it is the single point on the sheet a navigator could trust. That the traditions also put the world’s axis here is the coincidence the flat-earth cosmography lives on. Hindu and Buddhist cosmology set Mount Meru at the northern centre with the continents around it, which is very nearly this projection drawn as a mandala. The Greeks put Hyperborea beyond the north wind, a country of long days behind the mountains. Mercator’s 1595 chart of the north drew four rivers running out of a polar rock into four seas, and Olof Rudbeck in seventeenth-century Sweden argued the Atlantis of Plato had been up here all along. The Freemasons and the Theosophists inherited the whole apparatus and made the pole the source of the primeval wisdom. The sober version is that a hub is a natural place to put an origin, and that people who lived under a sky that turns visibly about one fixed point were never going to think of it as empty.',
    talk: '“The one honest spot on the sheet, and every tradition that ever drew a world put its holy mountain here. Perhaps because the sky wheels round it and nothing else does.”',
  },
  'grid:icewall': {
    name: 'The Ice Wall',
    glyph: '❄',
    meta: ['Antarctica', 'The rim of the projection', 'Piri Reis & Hapgood'],
    body:
      'On this sheet the south pole is not a point: it is the whole circumference. That is not a cosmological claim, it is arithmetic — an azimuthal equidistant projection maps colatitude to radius, so the far antipode of the centre has to be smeared around the edge, and Antarctica with it. The flat-earth cosmography takes the artefact for the article and reads that ring as a wall of ice holding the sea in, which is why every reprint of Gleason’s 1892 map since the 1950s has been sold with that gloss. The wall does exist in one honest sense: the Ross and Ronne shelves present a cliff of ice a hundred and eighty feet high and hundreds of miles long, and it stopped Ross’s ships dead in 1841. The esoteric literature adds a second layer here. In 1929 the Piri Reis map of 1513 was rediscovered in Istanbul, and in Maps of the Ancient Sea Kings (1966) Charles Hapgood argued its southern coast was Antarctica drawn ice-free — evidence, he thought, of a lost civilisation of navigators, and of his own theory of earth-crust displacement. Cartographers answer that the coast is South America continued along the sheet’s edge because the parchment ran out, which is a very ordinary thing for a portolan to do.',
    talk: '“The pole became a circle the moment we flattened the sheet, and then people went looking for what the circle was made of. Ice, they decided. There is ice — a hundred and eighty feet of it, and it stopped Ross. It is just not a wall round anything.”',
  },
  'grid:vortices': {
    name: 'The Twelve Vortices',
    glyph: '◈',
    meta: ['Sanderson, Saga, 1972', '±30°, seventy-two degrees apart', 'Twelve points, one icosahedron'],
    body:
      'The ten dashed lozenges on this chart, and the two poles, are Ivan T. Sanderson’s. A naturalist with a weakness for a pattern, he published “The Twelve Devil’s Graveyards Around the World” in Saga in 1972: ten patches of sea and desert where he counted an excess of vanished ships and aircraft — the Bermuda Triangle, the Devil’s Sea off Japan, the Algerian megalithic country, the Indus mouth, the sea east of Hawaii, and five more in the southern hemisphere at the same spacing — set five to a hemisphere and seventy-two degrees of longitude apart, with the poles making twelve. Twelve points arranged like that are the vertices of an icosahedron, which is exactly the door the Soviet crystal-grid paper walked through the following year. Some later writers went further and matched the twelve to the twelve portals of the winds in the Astronomical Book of Enoch, three to each quarter of heaven, which is how a magazine article about missing aeroplanes ended up in the same sentence as a Second Temple apocalypse. The counting has never survived inspection: the lozenges are drawn wide enough to catch the world’s busiest shipping lanes and its worst weather, and Lloyd’s of London has never charged a premium to cross any of them.',
    talk: '“Ten holes in the sea and two at the poles, and if you join them you have a Platonic solid. He may have found the shape of the earth’s temper. He may have found the shipping lanes.”',
  },

  /* ————— the earth grid: Egypt and the Near East ————— */
  'grid:giza': {
    name: 'Giza',
    glyph: '△',
    meta: ['30° N', 'The master node', 'The meridian of the ancients'],
    body:
      'The Giza plateau sits within a hundredth of a degree of the thirtieth parallel, a third of the way from equator to pole, and its builders squared the Great Pyramid to true north to within about three minutes of arc. It is the anchor of every planetary grid ever drawn — the Soviet crystal paper fixed its lattice at the poles and here, and the Becker–Hagens subdivision inherited that choice — and it stands on Alison’s great circle as well, which no other site of this rank does. More than one nineteenth-century pyramidologist argued that the meridian of Giza, not Greenwich, was the natural zero the ancients had already fixed the world to; the sober point in the neighbourhood of that claim is that the pyramid’s own meridian is a real astronomical instrument, ruled on this chart in gold, and that whoever laid it out could find true north better than a modern surveyor without instruments has any right to. Whether the plateau was placed to satisfy a global scheme, or the global schemes were drawn to pass through the plateau, is the question the whole subject turns on. Switch the instrument to the third chart and the plateau itself is on the table.',
    talk: '“Every lattice anyone has drawn puts its heaviest knot here — and then declares the fit remarkable. Ask which came first, the knot or the string.”',
  },
  'grid:petra': {
    name: 'Petra',
    glyph: '⌂',
    meta: ['Nabataean, c. 300 BCE', 'On the great circle', 'Cut, not built'],
    body:
      'Petra is a city carved into the rose sandstone of a Jordanian gorge by the Nabataeans, the caravan aristocracy who taxed the incense road from Arabia to Gaza, and it is on this chart for two reasons. It falls six miles from Alison’s great circle and half a degree from the thirtieth parallel, and it is the clearest case in the Near East of a monumental architecture that is subtracted rather than added — the great facade of Al-Khazneh is a Hellenistic temple front with nothing behind it, quarried out of the cliff from the top down. That technique is why Petra keeps company in the alternative literature with the rock-cut work at Giza, at Ellora, and at Ollantaytambo: the shared claim is that cutting on this scale argues a lost method. The Nabataeans, for their part, left inscriptions, coins, a hydraulic engineering system of dams and cisterns that made a city possible in a desert, and dates. What they did not leave is any hint that they thought they were standing on a line.',
    talk: '“Carved downward out of the living cliff, and then the desert kept it. Six miles off the great circle — near enough for the theorists, far enough for the sceptics. Petra is used to being both.”',
  },
  'grid:baalbek': {
    name: 'Baalbek',
    glyph: '⊓',
    meta: ['Heliopolis of Syria', 'The trilithon', 'Eight hundred tons'],
    body:
      'Baalbek in the Lebanese Beqaa is the site the “they could not have done this” argument always comes back to, and with the best material. Under the Roman temple of Jupiter Heliopolitanus runs a podium course of three limestone blocks, the trilithon, each about nineteen metres long and weighing on the order of eight hundred tonnes — the largest worked stones ever set in a wall anywhere. In the quarry below lie two larger ones still, the Stone of the Pregnant Woman at roughly a thousand tonnes and a block found in 2014 at about sixteen hundred, the heaviest ever cut by human hands. Zecharia Sitchin and others made the platform a landing stage for the Anunnaki; Erich von Däniken made it an aerodrome. The archaeology is less exciting and more impressive: the blocks are Roman, first century, cut a few hundred metres away, moved along a prepared ramp on rollers or a rolling frame with capstans and enormous quantities of organised labour, and the whole exercise was a statement of imperial capability, which is exactly what it still is. The older sanctuary beneath is Phoenician, to Baal, and the site was holy for a thousand years before Rome arrived to out-build everyone.',
    talk: '“Eight hundred tonnes, and one still in the quarry at sixteen hundred. People look at that and reach for visitors from elsewhere. I look at it and think somebody wanted very badly to be remembered, and got their wish.”',
  },
  'grid:gobekli': {
    name: 'Göbekli Tepe',
    glyph: '☰',
    meta: ['c. 9500 BCE', 'Older than farming', 'Deliberately buried'],
    body:
      'Göbekli Tepe is the site that made the rest of this chart harder to dismiss, and it did it by being real. On a limestone ridge in south-eastern Anatolia, Klaus Schmidt’s excavations from 1995 uncovered rings of T-shaped pillars up to five and a half metres tall and sixteen tonnes in weight, carved in relief with foxes, boars, cranes, scorpions and vultures — and radiocarbon dated the enclosures to the tenth millennium BCE. That is seven thousand years before Stonehenge and some five hundred before the earliest domesticated wheat, built by people who had no pottery, no metal, no writing and, so the textbooks had said, no capacity for monumental architecture. It also appears to have been intentionally backfilled. The alternative literature was quick and not always wrong: the site does demolish the tidy sequence in which farming produces surplus, surplus produces temples. Martin Sweatman has argued the reliefs of the Vulture Stone encode a comet impact at the onset of the Younger Dryas around 10,800 BCE; the excavators read them as a symbolic bestiary and treat the astronomical decoding as unfalsifiable. Both sides agree on the thing that matters: the temple came first.',
    talk: '“Eleven and a half thousand years old, and buried on purpose by the people who raised it. The textbooks said temples came after farming. Göbekli Tepe says somebody wanted a temple badly enough to invent the rest.”',
  },
  'grid:tassili': {
    name: 'Tassili n’Ajjer',
    glyph: '⊙',
    meta: ['Central Sahara', '15,000 paintings', 'The green Sahara'],
    body:
      'The Tassili n’Ajjer is a sandstone massif in the Algerian Sahara carrying one of the greatest concentrations of prehistoric art on earth — some fifteen thousand engravings and paintings spanning perhaps ten thousand years, and among them elephants, giraffe, hippopotamus and herds of cattle. They are the proof, drawn from life, that the Sahara was grassland and lake within human memory: the African Humid Period ended around 5,000 years ago and the desert closed over a populated country. That fact does more work for the lost-civilisation literature than any of its own arguments do, because it means a habitable landscape the size of the United States really did vanish, taking whatever was on it. Henri Lhote, who published the paintings in the 1950s, gave one great round-headed figure the nickname “the Great Martian God”, and the ancient-astronaut writers of the next decade took the joke and ran; the figures are now read as masked dancers, which is what the rest of the panel is doing. Tassili also sits exactly on Alison’s great circle, between Giza and the Atlantic, with no measurable deviation at all.',
    talk: '“Giraffe and hippopotamus, painted where nothing has drunk for five thousand years. Before you ask what civilisation the desert swallowed, notice that the desert is the new thing here.”',
  },

  /* ————— the earth grid: Europe ————— */
  'grid:stonehenge': {
    name: 'Stonehenge',
    glyph: '☉',
    meta: ['Salisbury Plain', 'Aligned to the solstice', 'The bluestones came 150 miles'],
    body:
      'The stones keep an alignment nobody disputes: the axis of the horseshoe and the avenue point to midsummer sunrise one way and midwinter sunset the other, so the monument is a working solar instrument some four and a half thousand years old. The bluestones of the inner setting were brought from the Preseli hills of west Wales, a hundred and fifty miles off — and in 2021 a Welsh stone circle at Waun Mawn was proposed as a monument dismantled and carried east, which would make Stonehenge partly a rebuilt inheritance. That is a labour only explicable if the stones themselves, or their provenance, were held to be charged. Where the arguments start is what else it measures. Gerald Hawkins ran the sightlines through an IBM 7090 in 1963 and called it a neolithic computer; Fred Hoyle added an eclipse predictor; Alexander Thom, surveying hundreds of British circles, argued for a standard unit he called the megalithic yard and for a class of deliberate astronomer-surveyors. Richard Atkinson’s reply to Hawkins — “moonshine” — set the tone of the reaction, and most archaeologists now hold the solar axis to be certain and the rest of the instrument to be reading our own arithmetic back to us.',
    talk: '“Nobody argues about the solstice line; it is simply there, and it is older than writing. It is everything ELSE people have found in the stones that has kept the argument going for three hundred years.”',
  },
  'grid:glastonbury': {
    name: 'The St Michael Line',
    glyph: '↗',
    meta: ['John Michell, 1969', 'Cornwall to Norfolk', 'The dragon-slaying saints'],
    body:
      'The short gold rule across southern England is the most famous ley of them all. In The View Over Atlantis (1969) John Michell traced an alignment running from St Michael’s Mount on the Cornish coast through Glastonbury Tor, Avebury and Bury St Edmunds to the Norfolk shore — strung, he pointed out, with an improbable number of churches and hilltop chapels dedicated to Michael and George, the two dragon-slaying saints, who so often mark a Christianised pagan power-spot. Later writers, Hamish Miller and Paul Broadhurst in The Sun and the Serpent (1989), dowsed the line and found two currents winding about it, which they named Michael and Mary. Glastonbury Tor is the line’s heart and the best single argument for the whole idea: a terraced conical hill with a ruined Michael tower on it, tied by tradition to Joseph of Arimathea, to the Grail, and to Avalon. The line’s critics measured it and found what they expected — the alignment is a few miles wide in places, and dedications to Michael are so common in England that a line drawn almost anywhere will collect some. Michell’s reply was that the ancients surveyed to a tolerance we have simply lost the habit of respecting.',
    talk: '“Lay a straight edge from the Cornish tip to the Norfolk coast and the chapels of Michael and George come up on it like beads on a thread. Then measure the thread’s thickness, and decide for yourself.”',
  },
  'grid:carnac': {
    name: 'Carnac',
    glyph: '☰',
    meta: ['Brittany, c. 4500 BCE', 'Three thousand menhirs', 'Thom’s megalithic yard'],
    body:
      'At Carnac in southern Brittany some three thousand standing stones run in parallel rows for four kilometres — the Ménec, Kermario and Kerlescan alignments — set up over centuries from about 4500 BCE, which makes them older than Stonehenge, older than the pyramids, and the largest such arrangement anywhere. Nearby stood the Grand Menhir Brisé, a single stone of over three hundred tonnes and twenty metres, now broken in four. Alexander Thom, the Oxford engineer who surveyed hundreds of megalithic sites between the 1930s and the 1970s, argued that the Carnac rows and the great menhir together formed a lunar observatory of extraordinary precision, and that all these monuments were laid out in a common unit, the megalithic yard of 2.72 feet. Thom’s statistics have not held up well — the unit dissolves under re-analysis, and the lunar sightlines require the great menhir to have stood where it may not have. What survives is stranger for being simpler: for two thousand years, in one place, people kept adding stones to a line.',
    talk: '“Three thousand stones in rows four kilometres long, raised over twenty generations. Whatever a ley line is, this is somebody DOING it — deliberately, at enormous cost, and for a very long time.”',
  },
  'grid:newgrange': {
    name: 'Newgrange',
    glyph: '◠',
    meta: ['Boyne valley, c. 3200 BCE', 'The midwinter roofbox', 'Older than the pyramids'],
    body:
      'Newgrange in the Irish Boyne valley is a passage tomb of about 3200 BCE — five centuries older than the Great Pyramid — a great kerbed mound with a nineteen-metre passage running in to a corbelled chamber. Above the entrance is a slot in the stone, the roofbox, and for a few mornings around the winter solstice the rising sun comes through it and runs the length of the passage to light the back wall. Michael O’Kelly, excavating in 1967, watched it happen and put beyond argument that the alignment was designed. That is the single cleanest demonstration in Europe that a neolithic monument could be an instrument: not a statistical claim about sightlines, but a beam of light arriving on a date. The kerbstones carry the spirals, lozenges and chevrons of Irish megalithic art, and the entrance stone’s triple spiral is the most reproduced image in the country. Whether the art is a map of anything is not known; whether the building is a calendar is not in doubt.',
    talk: '“Five hundred years before Khufu, and it still works. Stand in the chamber on the right morning and the sun walks up the passage to your feet. No statistics required.”',
  },
  'grid:delphi': {
    name: 'Delphi',
    glyph: '◉',
    meta: ['The omphalos', 'Navel of the world', 'Two eagles of Zeus'],
    body:
      'Delphi kept a carved stone called the omphalos, the navel, and the Greeks meant it: Zeus had loosed two eagles from the ends of the earth and they met here, so this was the world’s centre and the stone marked the point. That is the oldest surviving instance of the idea this whole chart is built on — that a landscape has a measurable middle and it can be found. John Michell made a great deal of Delphi in his geodetic writing, arguing that its distances to other Greek sanctuaries encode a deliberate national survey; the Greeks themselves credited the sanctuary’s siting to the god and its accuracy to the birds. The oracle spoke from a chamber over a fissure, and in 2001 a team led by the geologist Jelle de Boer traced ethylene rising through the faulted limestone beneath the temple, which is at least a mechanism for a priestess in an altered state. What Delphi also has is the plainest statement of what these places were for, cut at the entrance: know thyself.',
    talk: '“Two eagles, loosed from the ends of the earth, met here — so the Greeks fixed a stone and called it the navel. Every grid on the other chart is that same instinct with better arithmetic.”',
  },

  /* ————— the earth grid: Asia ————— */
  'grid:mohenjodaro': {
    name: 'Mohenjo-Daro',
    glyph: '⊞',
    meta: ['Indus, c. 2500 BCE', 'A grid of streets', 'On the great circle'],
    body:
      'Mohenjo-Daro on the lower Indus was one of the two capitals of the Harappan civilisation, and it is on this chart because it is a grid in the literal sense: laid out around 2500 BCE on a planned rectilinear street pattern oriented to the cardinal points, with baked-brick houses, covered drains along every street, wells, a Great Bath, and a standardised system of weights used across a territory larger than Egypt and Mesopotamia combined. It also falls twenty miles from Alison’s great circle, and Sanderson put one of his twelve lozenges over the Indus mouth. What Mohenjo-Daro will not do is talk: its script, some four hundred signs in inscriptions rarely longer than five characters, has resisted every attempt at decipherment, and so the most orderly ancient civilisation on earth is also the most silent one. Into that silence the literature has poured a great deal, including a persistent claim of vitrified brick and radioactive skeletons from a nuclear war in the Mahabharata, which the excavation reports do not support at any point. The real mystery is quieter: a civilisation of a million people with no palaces, no royal tombs, and no monuments to any king.',
    talk: '“Drains under every street, weights identical across a thousand miles, and not one line of it readable. The most organised people of the ancient world, and we do not know what they called themselves.”',
  },
  'grid:kailash': {
    name: 'Mount Kailash',
    glyph: '△',
    meta: ['Tibet, 6,638 m', 'Axis of four religions', 'Never climbed'],
    body:
      'Kailash is the holy mountain of four traditions at once — Hindu, Buddhist, Jain and Bön — and none of them has ever permitted anyone to climb it. It is held to be the earthly Mount Meru, the axis of the world, the throne of Shiva; pilgrims walk the fifty-two kilometre kora around its base, some of them prostrating the whole way. Four great rivers rise within sixty miles of it, the Indus, the Sutlej, the Brahmaputra and the Karnali, which is as close as geography comes to the four rivers of paradise, and it is the reason the mountain was identified as the centre in the first place. On this chart it stands just off the thirtieth parallel, and the grid literature makes much of that and of the mountain’s four notably regular faces, which some writers have claimed for a built pyramid — a Russian expedition in the 1990s argued for an entire complex of them. Geologists see a horizontally bedded conglomerate weathered along its joints, which is a mountain doing what that rock does. The stranger fact needs no argument: of all the great peaks on earth, this is the one nobody has stood on.',
    talk: '“Four religions, four rivers, four faces — and no summit photograph, because no one has been allowed up. The one holy mountain the twentieth century did not conquer.”',
  },
  'grid:angkor': {
    name: 'Angkor',
    glyph: '卍',
    meta: ['Khmer, 12th century', '72° from Giza', 'Hancock’s Heaven’s Mirror'],
    body:
      'Angkor is the largest religious complex ever built — a hydraulic city of a million people with a thousand temples in it, raised by the Khmer between the ninth and fifteenth centuries, with Angkor Wat itself as Suryavarman II’s temple-mountain to Vishnu, its towers a model of Meru and its moat the encircling ocean. The alternative literature’s claim, made most fully in Graham Hancock and Santha Faiia’s Heaven’s Mirror (1998), is that the scatter of Angkor’s principal temples reproduces the constellation Draco as it stood at the spring equinox of 10,500 BCE — the same date the Orion correlation reaches for at Giza — and that Angkor sits 72° of longitude east of Giza, seventy-two being the number of years the sky precesses through one degree. The Khmer inscriptions and the temples’ own iconography are explicit and quite different: this is Hindu-Buddhist cosmology built at scale, and Angkor Wat is aligned to the equinox sunrise over its western causeway, which is impressive and which the Khmer would have told you about themselves. Angkor also falls within a degree of Alison’s great circle, which the temple’s builders certainly did not mention.',
    talk: '“The largest thing anyone ever built for a god, and seventy-two degrees from Giza — one degree of precession for every year. Coincidence has a way of looking like arithmetic here.”',
  },
  'grid:yonaguni': {
    name: 'Yonaguni',
    glyph: '▤',
    meta: ['Ryukyu Islands', 'Under 25 metres of sea', 'Cut or cracked?'],
    body:
      'Off Yonaguni, the westernmost of the Ryukyu islands, a diver found in 1986 a submerged formation of flat terraces, right angles and what look like steps, lying in about twenty-five metres of water. Masaaki Kimura of the University of the Ryukyus has argued for thirty years that it is worked — a terraced monument, with quarry marks, drainage channels and a road — and if any part of it is, then it was cut before the sea rose over it at the end of the last glaciation, which puts it well beyond ten thousand years old. Robert Schoch, who dived the site, concluded the opposite: the sandstone there is thickly bedded and jointed along two perpendicular sets, and it fractures naturally into exactly these blocks and steps. So Yonaguni is the cleanest test case in the whole field of a question that has no rhetoric in it — are those cuts, or are those joints? — and the two best-qualified people to have looked disagree. What is not in dispute is the sea level: any coastal work older than about eight thousand years is under water now, everywhere, and that alone should make anyone humble about where the earliest cities were.',
    talk: '“Steps, terraces, right angles, and twenty-five metres of ocean on top. Two geologists dived it and came up with two answers. That is worth more than a hundred confident ones.”',
  },
  'grid:devilsea': {
    name: 'The Devil’s Sea',
    glyph: '◈',
    meta: ['South of Japan', 'Sanderson’s antipode', 'The Dragon’s Triangle'],
    body:
      'The stretch of Pacific south and east of Honshu is the Devil’s Sea, Ma-no Umi, and it is the eastern twin of the Bermuda Triangle in Ivan Sanderson’s scheme — one of his ten lozenges at thirty degrees of latitude, seventy-two degrees of longitude from its neighbours, the pattern that makes twelve points and an icosahedron when the poles are added. Charles Berlitz gave it a book in 1989 and reported that Japan had lost five military vessels and seven hundred men there between 1952 and 1954 and declared the area a danger zone. Larry Kusche, who had already taken the Bermuda Triangle apart file by file, went looking for the Japanese sources and found that the losses were fishing boats, that they were spread over a much wider area and a longer time, and that the “research vessel” lost in 1953, the Kaiyo Maru No. 5, went down with its crew while observing an erupting undersea volcano — which is a hazard, but not a mystery. The region is genuinely dangerous: it sits over an active volcanic arc where seamounts appear and vanish, and typhoons cross it. The grid needs the point; the sea does not need the grid.',
    talk: '“Seventy-two degrees from Bermuda, at the same latitude, which is what the pattern wanted. The ships that sank here sank over a volcano. Both things are true, and only one of them is geometry.”',
  },
  'grid:nanmadol': {
    name: 'Nan Madol',
    glyph: '▦',
    meta: ['Pohnpei, c. 1200 CE', 'Ninety-two artificial islets', 'Basalt logs'],
    body:
      'Nan Madol is a city of ninety-two artificial islets built on a reef off Pohnpei in Micronesia, laced with canals, walled with naturally prismatic basalt columns stacked like timber — some of the stones weighing several tonnes, and the whole complex estimated at three quarters of a million tonnes of rock, moved and set by a population that never numbered more than a few tens of thousands. It was the ceremonial seat of the Saudeleur dynasty from about 1200 CE, and Pohnpeians still tell you it was raised by two sorcerers who flew the stones into place. Because it stands in the middle of the Pacific and is built of something that looks manufactured, Nan Madol has been recruited for Lemuria and for Mu, James Churchward’s lost Pacific continent, and the site is often called the Venice of the Pacific by people who mean something stranger than Venice. The archaeology is not diminished by being ordinary: this is the largest construction in Oceania, it was done by islanders, and it is falling into the sea as the water rises.',
    talk: '“Three quarters of a million tonnes of basalt, out in the open Pacific, stacked like cordwood. The islanders say two sorcerers flew it there. Someone certainly moved it.”',
  },
  'grid:uluru': {
    name: 'Uluru',
    glyph: '⌒',
    meta: ['Central Australia', 'The songlines', 'Anangu country'],
    body:
      'Uluru is a single mass of arkose sandstone standing three hundred and forty metres above the desert with far more of it below, and it is on this chart for a reason none of the other sites can claim: here the lines are not a modern theory. The Anangu, and Aboriginal Australians generally, hold a body of knowledge of paths across country — the songlines, or Dreaming tracks, each carrying a sequence of places in a sung order that also serves as navigation across hundreds of miles of land with no landmark a European would use. That is the real thing the ley theorists have been reaching for: a landscape genuinely organised into named routes, held in memory, and sacred. It is also not a grid, not geometrical, and not about energy — it is law, story and title, and the tracks follow water and the shape of the ground. Uluru’s own surface is a text in that system, each fissure and cave belonging to an episode, some of it restricted knowledge that the traditional owners ask not be photographed. The climb was closed in 2019 at their request.',
    talk: '“Everywhere else on this chart, the lines are ours. Here they belong to somebody, they are sung rather than drawn, and they were never about energy — they are the law and the way home.”',
  },
  'grid:rapanui': {
    name: 'Rapa Nui',
    glyph: '⚇',
    meta: ['Easter Island', 'The remotest node', 'On the great circle'],
    body:
      'Rapa Nui is the loneliest inhabited speck in the Pacific, more than a thousand miles from the nearest neighbour, and it falls on Alison’s great circle with no measurable deviation — which is exactly why the theorists prize it: a point in open ocean, too far out for a line to reach by chance. Its people raised nearly nine hundred moai, of which almost all face inland with their backs to the sea, watching over the villages they were carved to guard, and nearly four hundred more lie unfinished in the Rano Raraku quarry. The standard cautionary reading — forests felled to move the statues, a society that ate its own island — has been substantially revised: Terry Hunt and Carl Lipo argue the palms were destroyed mainly by rats arriving with the settlers, that the moai were walked upright by small teams rather than dragged, and that the true collapse came with slave raiding and smallpox in the nineteenth century. The older question the moai still ask is why a few thousand people at the edge of the world spent themselves filling it with faces.',
    talk: '“A node in the empty ocean, too far out for a line to reach by accident — so the theorists love it. And the stone watchers stand with their backs to the sea, minding the land.”',
  },

  /* ————— the earth grid: the Americas and the south ————— */
  'grid:teotihuacan': {
    name: 'Teotihuacán',
    glyph: '△',
    meta: ['c. 100–550 CE', 'The Street of the Dead', '15.5° east of north'],
    body:
      'Teotihuacán was the largest city in the Americas and one of the largest on earth, with perhaps a hundred and fifty thousand people in it, and the Aztecs who found it abandoned centuries later named it the place where the gods were made and buried their own kings in its shadow. Its Pyramid of the Sun has a base close to that of the Great Pyramid at Giza on a footprint half the height, which is the fact every comparison starts from; the Street of the Dead runs for two and a half kilometres on a bearing 15.5° east of north, and the whole city — canalised river included — was made to obey that axis. Why that angle is a real archaeological question with real answers on offer: a setting sun on particular dates, the Pleiades’ heliacal rising, or a calendrical geometry. The alternative literature goes further, matching the three main pyramids to Orion’s belt as at Giza and finding a scale model of the solar system laid out along the avenue, a claim of Hugh Harleston’s from the 1970s that requires a unit nobody has otherwise found. Teotihuacán’s own writing does not survive well enough to settle it, and we still do not know what its builders called themselves.',
    talk: '“The Aztecs came here and decided the gods had been made in this place. They were the tourists. Whoever laid out that avenue was already fifteen hundred years gone.”',
  },
  'grid:serpentmound': {
    name: 'Serpent Mound',
    glyph: '∽',
    meta: ['Ohio, c. 300 BCE–1000 CE', 'A quarter mile of snake', 'Solstice-aligned head'],
    body:
      'Great Serpent Mound in southern Ohio is an effigy of a snake four hundred and eleven metres long, coiled tail at one end and a head with an open oval at the other, raised on a plateau above Brush Creek — and the plateau itself sits inside a cryptoexplosion structure, either a meteorite crater or a volcanic collapse, which is a coincidence the site’s admirers have never got over. The head is held to align to the summer solstice sunset and the coils to other solar and lunar events. It belongs to a wider phenomenon that deserves this chart more than most of its residents: the Ohio valley earthworks of the Adena and Hopewell, thousands of mounds, and at Newark a set of geometric enclosures — a circle, an octagon, a square — laid out on a common unit and, as Ray Hively and Robert Horn showed in 1982, aligned to the eight extremes of the moon’s 18.6-year cycle. That is a genuine astronomical achievement from a people the nineteenth century insisted could not have built their own mounds, and who were robbed of the credit for a century by exactly the argument the Great Zimbabwe entry on this chart describes.',
    talk: '“Four hundred metres of serpent on the lip of an old crater, and geometry down the valley at Newark that catches the moon at all eight of its turnings. The mounds were never a mystery to the people who built them.”',
  },
  'grid:bermuda': {
    name: 'The Bermuda Triangle',
    glyph: '◈',
    meta: ['Sanderson’s first lozenge', 'The Bimini Road', 'Cayce’s 1968 prophecy'],
    body:
      'This lozenge is where the whole vortex literature began. The Bermuda Triangle got its name from a magazine article by Vincent Gaddis in 1964 and its fame from Charles Berlitz in 1974; Ivan Sanderson made it the first of his twelve devil’s graveyards in 1972, and its position at thirty degrees north set the spacing for the other nine. Larry Kusche then did the thing nobody had done and read the original casualty records, publishing The Bermuda Triangle Mystery — Solved in 1975: ships listed as vanishing in calm weather had gone down in gales, some had sunk elsewhere entirely, some had never existed, and the loss rate for the area turned out to be unremarkable for a region of heavy traffic, the Gulf Stream and hurricanes. Inside the triangle sits its own relic. In 1968 divers found a half-mile line of rectangular limestone blocks in shallow water off North Bimini, which Edgar Cayce’s followers greeted as the fulfilment of his prophecy that a part of Atlantis would rise near Bimini in “sixty-eight or sixty-nine”. Geologists identify it as beachrock, cemented shoreline sand that cracks into orderly blocks as it weathers — the same answer, and the same argument, as Yonaguni.',
    talk: '“Cayce said Atlantis would show itself near Bimini in sixty-eight, and in sixty-eight somebody found a road of blocks there. Beachrock, say the geologists. It is a very good road for a prophecy.”',
  },
  'grid:nazca': {
    name: 'The Nazca Lines',
    glyph: '◊',
    meta: ['Peru, 500 BCE–500 CE', 'Lines and figures', 'On the great circle'],
    body:
      'On the high desert of southern Peru the Nazca scored hundreds of dead-straight lines, geometric trapezoids and vast figures — a hummingbird, a spider, a monkey, a condor — into the ground between roughly 500 BCE and 500 CE, by clearing the dark oxidised stones to show the pale ground beneath, at a scale that resolves into a picture only from the air. That last fact made them the centrepiece of the ancient-astronaut literature, and von Däniken’s runways; Maria Reiche spent forty years measuring and defending them, and Paul Kosok called the pampa the largest astronomy book in the world. The sober account is better: the lines were walked, as ceremonial pathways, and they run overwhelmingly toward water — to the foot of the mountains the rivers come from, and to the puquios, the underground aqueducts that made life here possible. Anthony Aveni’s survey found the radial line centres clustered on watercourses. Nazca is also, on this chart, the clearest surviving example of the impulse the leys only hint at: a whole landscape deliberately ruled straight and held sacred for it. And it falls exactly on Alison’s great circle, which is why he began to suspect the pampa was a map of one.',
    talk: '“Miles of line ruled dead straight, and figures you cannot read until you leave the ground. Ask what they were drawn for, and you have asked the whole riddle of the straight track.”',
  },
  'grid:tiwanaku': {
    name: 'Tiwanaku',
    glyph: '⊟',
    meta: ['Lake Titicaca, 3,850 m', 'Puma Punku', 'Posnansky’s 15,000 BCE'],
    body:
      'Tiwanaku stands on the Bolivian altiplano near Lake Titicaca at nearly four thousand metres, and at that altitude the maize the state ran on will not grow — which is the first strange thing about it. Its Gate of the Sun is cut from a single block; the nearby Puma Punku platform has andesite blocks finished to flat faces, internal right angles and machined-looking H-shaped modules that interlock, some of them weighing over a hundred tonnes and quarried ninety kilometres off. Arthur Posnansky, who worked there for fifty years, used the alignment of the Kalasasaya enclosure and the changing obliquity of the earth’s axis to date the site to about 15,000 BCE; radiocarbon puts the monumental phase between roughly 500 and 1000 CE, and Posnansky’s method fails because it assumes the builders aimed at exactly the solstice azimuth and hit it exactly. What is not explained away is the stoneworking, which is the finest in the pre-Columbian Americas and was done without iron; the accepted answer is stone hammers, sand abrasion, and an enormous investment of time, and the honest position is that nobody has fully reproduced it.',
    talk: '“Cut andesite with internal right angles, at thirteen thousand feet, without iron. The dates are settled and the method is not. I would rather be told the truth about the method.”',
  },
  'grid:greatzimbabwe': {
    name: 'Great Zimbabwe',
    glyph: '◍',
    meta: ['11th–15th century', 'Dry-stone, no mortar', 'A lesson about this chart'],
    body:
      'Great Zimbabwe is a city of dry-stone walls in the Zimbabwean highveld — the Great Enclosure’s outer wall is 250 metres round, up to eleven metres high and five thick, built of a million shaped granite blocks without a scrap of mortar, and at its height in the fourteenth century the city held perhaps eighteen thousand people and traded gold and ivory to the Swahili coast for Chinese celadon and Persian glass. It is on this chart as a warning, and the warning is aimed at everything else on it. From the 1890s the Rhodesian settler state insisted Africans could not have built it, and produced Phoenicians, Sabaeans and the Queen of Sheba instead; when the archaeologists David Randall-MacIver in 1906 and Gertrude Caton-Thompson in 1929 reported it was unambiguously African and medieval, the government suppressed the finding and, into the 1970s, instructed museum staff not to say so. The country took its name from the site at independence. The lesson generalises: the instinct to look for a lost civilisation behind an achievement is not always innocent, and it has a documented history of being applied to precisely those builders whose descendants were inconvenient.',
    talk: '“A million blocks, no mortar, and a government that made its museums lie about who laid them. Whenever you feel the pull of ‘they could not have built this’ — remember that somebody has felt it before you, and what they did with it.”',
  },

  /* ————— the Giza plateau ————— */
  'giza:pyramids': {
    name: 'The Great Pyramid',
    glyph: '△',
    meta: ['Khufu, c. 2560 BCE', 'Squared to true north', 'The pyramid inch'],
    body:
      'The Great Pyramid of Khufu is the eldest of the seven wonders and the only one standing, and the one monument the esoteric tradition has never stopped measuring. Its base of 230.33 metres is level to about two centimetres across five and a half hectares; its sides are squared to the cardinal points to within about three minutes of arc; and the ratio of its perimeter to its height comes to within a fraction of a percent of 2π, which may be a deliberate encoding of the circle or may simply be what you get if you measure a slope with a rolling drum. Two and a half million blocks were set in perhaps twenty years. That precision unsettled the Victorians into a whole discipline — pyramidology — which held the building to encode the size of the earth, the length of the year, and in the corridors of its interior a prophetic chronology of history; Piazzi Smyth, Astronomer Royal for Scotland, staked his reputation on the “pyramid inch” in the 1860s, having first decided what unit he wanted to find. Egyptology reads it as a royal tomb raised by a confident and superbly organised state, and the plateau outside — the town, the bakeries, the workers’ cemetery — is where that reading gets its evidence. What keeps the older question alive is inside: four narrow shafts, cut to point at particular stars.',
    talk: '“They have measured this stone for three hundred years and never agreed what the measurements mean. Tomb, almanac, prophecy in granite — it holds still and lets each age read itself into it.”',
  },
  'giza:sphinx': {
    name: 'The Great Sphinx',
    glyph: '♞',
    meta: ['Lion body, human face', 'The water-erosion debate', 'Facing the equinox sunrise'],
    body:
      'The Sphinx lies along the eastern edge of the plateau in a ditch cut down into the bedrock, a lion’s body with a king’s face, gazing due east to where the sun rises at the equinox. Orthodox dating ties it to Khafre, around 2500 BCE, on the evidence of its position at the head of his causeway, the style of the headdress and the temple built in front of it from the same stone. The argument on this chart is about the walls of that ditch. In 1991 the geologist Robert Schoch, brought to the site by the writer John Anthony West, reported that their deeply undulating vertical profile is the signature of prolonged rainfall rather than of wind and sand, and that the enclosure must therefore have been open to a far wetter climate — which in Egypt means before about 5000 BCE. He proposed 7000–5000 BCE and has since gone earlier; West and later Hancock reached for 10,500. Egyptologists and several geologists answer that the weathering is salt and moisture attack on a soft marl bed, worsened by modern groundwater, and that a much older Sphinx leaves no trace of the society that carved it. Colin Reader’s middle position — that the enclosure was cut somewhat before Khufu, by rain-driven runoff from the slope above — is the one that has travelled furthest into the mainstream. And there is the head: too small for the body by any Egyptian canon, which argues it was recut, and leaves open what it was recut FROM.',
    talk: '“Look at the rain-cut stone of its ditch and ask what weather carved it. Ask it honestly, mind — because salt and modern groundwater will cut stone too, and the answer that flatters us is not automatically the true one.”',
  },
  'giza:orion': {
    name: 'The Belt of Orion',
    glyph: '✦',
    meta: ['Bauval, 1994', 'Sah — the soul of Osiris', 'As above, so below'],
    body:
      'In The Orion Mystery (1994) the engineer Robert Bauval set the plan of the three Giza pyramids beside the three stars of Orion’s belt and found the same figure: two on a line and the third — Menkaure, like Mintaka — stepped off to one side, and the whole group canted at the angle the belt makes to the Milky Way, which the Nile below repeats. To the Egyptians Orion was Sah, the celestial form of Osiris, lord of the dead and of resurrection, and the Duat that the soul crossed lay in that quarter of heaven; read so, the west bank plateau is a deliberate mirror of the sky, and as above, so below is a floor plan rather than a motto. Bauval’s further move is the contested one: since the belt’s angle to the meridian changes with precession, he dated the LAYOUT to about 10,500 BCE, when the belt stood lowest, while dating the building to the pyramid age — a monument, then, marking an epoch far older than itself. The objections are specific. Ed Krupp pointed out that the ground plan matches the sky only if you invert one of them, so the correlation is mirrored; Tony Fairall calculated the angular fit and found the match to the belt poor at 10,500 and no better than at other dates; and 10,500 BCE has no Egyptian archaeology behind it at all. What survives every objection is the alignment inside the stone: the King’s Chamber’s southern shaft really was cut at 45°, and Alnitak really did cross the meridian at that altitude in Khufu’s own century.',
    talk: '“Three kings in the sand, three stars on the belt, the same crooked line. Then he asked WHEN the line was truest, and got an answer eight thousand years too early — and the argument has been about that ever since.”',
  },
  'giza:shafts': {
    name: 'The Star Shafts',
    glyph: '↗',
    meta: ['45° · 32.6° · 39.6° · 39.1°', 'Alnitak, Thuban, Sirius, Kochab', 'The Imperishable Ones'],
    body:
      'Four shafts about twenty centimetres square run out from the two chambers inside the Great Pyramid, two north and two south, and they are the hardest evidence on the plateau that the building was aimed at the sky. They are not ventilation: the Queen’s Chamber pair were sealed at both ends and discovered only in 1872, and no shaft leaves the burial chamber for any practical reason at all. The elevations are the point. The King’s Chamber’s southern shaft rises at 45°, its northern at 32.6°; the Queen’s southern at 39.6° and northern at 39.1°. In the pyramid age, precession put four particular stars at those altitudes as they crossed the meridian: Alnitak, the lowest star of Orion’s belt, at 45°; Sirius — Sopdet, the star of Isis, whose heliacal rising opened the year and the flood — at 39.6°; and to the north Thuban in Draco, then the pole star, and Kochab in the Little Bear, two of the circumpolar stars the Egyptians called the Imperishable Ones because they never set, and to which the dead king’s spirit was to join itself. Bauval’s dating of the shafts to about 2475 BCE is his least disputed contribution, and it is a date that agrees with the Egyptologists rather than defying them. Robert Gantenbrink’s robot found a limestone door with copper fittings in the southern Queen’s shaft in 1993; cameras beyond it in 2002 and 2011 found a small space, red ochre workmen’s marks, and another blocking. Nobody knows why it is there.',
    talk: '“Twenty centimetres square, sealed at both ends, and cut to point at Orion and at Sirius and at the stars that never set. Whatever else this building is, somebody meant it to look at something.”',
  },
  'giza:leo': {
    name: 'The Age of Leo',
    glyph: '♌',
    meta: ['Precession, 2,160 years a sign', 'c. 10,500 BCE', 'Zep Tepi, the First Time'],
    body:
      'The brass dial on the plateau’s western rim shows the mechanism the whole argument runs on. The earth’s axis wobbles once in about 25,800 years, so the constellation behind the rising sun at the spring equinox changes, one sign in roughly 2,160 years. The claim, made by John Anthony West and developed by Graham Hancock and Robert Bauval in Keeper of Genesis (1996), is this: a lion carved to face the equinox dawn is a lion facing its own image, and that was literally true around 10,500 BCE, when the sun rose at the equinox against the stars of Leo and the constellation stood due east at dawn. The same date is where Bauval’s Orion reckoning lands. Put together, the two make Giza a monument to Zep Tepi, the First Time, the age the Egyptians themselves said their gods had ruled in. Against it: precession is real and the calculation is right, but Leo is a Babylonian and then Greek figure, and the Egyptians’ own sky was divided quite differently — their lion, Aker or the double lion of the horizon, is not that patch of stars; the Dendera zodiac people cite is Greco-Roman, two thousand years after the pyramids. And the Sphinx faces the equinox sunrise in EVERY age, because that is where east is. The dial keeps both hands on it: one on Leo, one on Taurus, which is where the sun actually rose in Khufu’s spring.',
    talk: '“One sign every two thousand one hundred and sixty years. Wind it back to the Lion and the beast on the horizon looks at its own face. Wind it only to the Bull and you are in the age that left the building sites, the bakeries and the bones.”',
  },
  'giza:necropolis': {
    name: 'The Workers’ Town',
    glyph: '⌂',
    meta: ['Lehner & Hawass, 1988–', 'The Wall of the Crow', 'Bread, beer, cattle, bones'],
    body:
      'Behind the great stone wall at the south of this plateau — the Wall of the Crow, ten metres high — lies the answer to the question the rest of the chart keeps asking. From 1988 Mark Lehner and Zahi Hawass excavated Heit el-Ghurab, the settlement of the people who built the pyramids: galleries that slept perhaps forty men each, two industrial bakeries with vats for dough and bell-pots for baking, a building for salting fish, breweries, and copper workshops. The commissary accounts survive in the rubbish: they were eating cattle, sheep and goat in quantities that mean a state was provisioning them from estates up and down the country. Uphill is their cemetery, where the workers buried each other with small mud-brick tombs and titles — “overseer of the side of the pyramid”, “director of the draughtsmen” — and the skeletons show healed fractures and successful amputations, meaning injured men were treated and kept. In 2013 the Wadi al-Jarf papyri gave the diary of an inspector named Merer ferrying Tura limestone to Giza, dated to Khufu’s twenty-seventh year. Herodotus’s hundred thousand slaves and Hollywood’s whips are not in the record; rotating conscript gangs with names like “Friends of Khufu”, fed better than they would have been at home, are.',
    talk: '“Bakeries, breweries, a fish-salting works, and a graveyard where the men who fell off it were buried with their job titles. Whoever you think built this, they left their bread ovens behind.”',
  },
  'giza:nile': {
    name: 'The River & the Milky Way',
    glyph: '≈',
    meta: ['The Duat', 'Bauval’s mirror', 'The lost Khufu harbour'],
    body:
      'The river is drawn near the edge of this sheet for want of room — it lies about eight kilometres east — but it belongs on the chart, because the Nile does two things for the plateau. The practical one is that the pyramids could not have been built without it: the fine white Tura limestone came from the eastern bank by barge, granite came 900 kilometres from Aswan, and the Merer papyri describe the shuttle. A branch of the river, the Khufu branch, ran much closer in the third millennium than it does now, and sediment cores published in 2022 traced it and showed it stood high in exactly the centuries of the pyramid age and dwindled afterwards — so there was a harbour at the foot of the causeways, and the plateau was once nearly a port. The symbolic one is Bauval’s: the Egyptians placed the Duat, the sky-country the dead crossed, along the Milky Way, and the west bank of the Nile was where they buried their dead. If the belt of Osiris is laid out on the ground, then the river beside it is the celestial river, and the correlation is not three points but a landscape. The annual flood was Sirius’s doing — the star rose just before the sun as the water came — which is why one of the four shafts in the Great Pyramid is aimed at her.',
    talk: '“The stone came up this river and the dead went across it. And if the belt is on the ground here, then that water is the Milky Way — which is a great deal to ask of a river, and the Egyptians asked it.”',
  },
  'giza:enoch': {
    name: 'The Pyramid of Enoch',
    glyph: '☉',
    meta: ['Josephus, 1st century', 'Surid, Idris, Hermes', 'The Masons’ vault'],
    body:
      'One of two quite different things called an Enochian pyramid, and the older: the tradition that the Great Pyramid was raised before the Flood to save knowledge from it. Josephus, writing in the first century, says the sons of Seth inscribed their astronomy on two pillars, one of brick and one of stone, so that it should survive both fire and water — and later readers identified the stone one with the pyramids. The Arabic chroniclers made the story circumstantial. Al-Masʿūdī, al-Maqrīzī and others tell of an antediluvian king, Surid or Saurid ibn Salhūk, who dreamed of the heavens falling, had his priests confirm the coming deluge in the stars, and built the pyramids to hold the books of the sciences, the treasures and the bodies of his ancestors; Ibn Baṭṭūṭa gives the builder instead as Hermes Trismegistus, whom the Arabic tradition identified with the prophet Idrīs and Idrīs with the biblical Enoch — the man who walked with God and was not, and to whom the astronomical Book of Enoch is ascribed. The line runs on into Freemasonry, where the legend of Enoch’s nine-arched vault and his two pillars, one to survive flood and one fire, is worked into the Royal Arch degrees. It is a legend, not a chronology; but it is the direct ancestor of every modern claim that the plateau is a message deliberately left for a later age to read.',
    talk: '“Enoch, who is Hermes, who is Idrīs, read the Flood in the stars and wrote the sciences in stone so the water could not have them. Four traditions tell it. Not one of them is a date — and all of them are why we still come here looking for a message.”',
  },
  'giza:enochian': {
    name: 'The Enochian Pyramid',
    glyph: '⛢',
    meta: ['Dee & Kelley, 1582–87', 'The Watchtower squares', 'A different matter entirely'],
    body:
      'The other Enochian pyramid, and it is not Egyptian and not ancient — which is exactly why it stands at the plateau’s edge on a brass plinth rather than on the plateau. Between 1582 and 1587 John Dee, Elizabeth’s mathematician and astrologer, and the scryer Edward Kelley recorded an angelic language they called Enochian, on the understanding that it was the speech Adam had used and Enoch had recovered, together with four great lettered tablets — the Watchtowers of the four elements — and a fifth, the Tablet of Union. Each Watchtower is a grid twelve squares by thirteen, a hundred and fifty-six to a tablet. Three centuries later the Hermetic Order of the Golden Dawn elaborated every one of those squares into the solid turning here: a truncated pyramid whose four sloping faces carry the square’s elemental, zodiacal, planetary and sephirotic attributions, whose flat apex carries the Enochian letter itself as a throne for an Egyptian god-form, and on which stands a sphinx compounded of the four kerubic beasts — bull, lion, eagle and man — as the square’s guardian on the astral. Squares were classed as Sephirotic Crosses, Kerubic and Servient. Adepti scryed into them, and played Enochian chess on four boards that are the four Watchtowers drawn in this form. The Egyptian dress is Victorian: the Order borrowed its god-forms from the Egyptology of its own century, and the pyramid is a filing system for correspondences, not a monument.',
    talk: '“Four faces, a letter on the flat top, a sphinx of the four beasts standing guard — one for each of six hundred and twenty-four squares. Dee got the tablets from an angel. The pyramid is the Golden Dawn’s filing cabinet, and it has nothing to do with Khufu at all.”',
  },
};
