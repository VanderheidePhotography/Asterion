/**
 * The readings behind the rotunda's statuary — who each figure on the drum is,
 * and why a museum of Western esoteric history keeps them at its walls.
 *
 * Shaped to the ReadingDock's four parts, exactly like `planetLore.ts`: the
 * keeper's line, the title, the attribute chips, and the explanation proper.
 * Keyed by the figure's `kind` in `three/statues.tsx`.
 *
 * The history is the real history, dates and all — including the parts that
 * undercut the tradition's own claims about itself (Casaubon's dating of the
 * Hermetica, the Gnostic Sophia's fall). This is a museum, not an oracle.
 */

export interface StatueLore {
  name: string;
  glyph: string;
  /** attribute chips: office, dates, text, emblem */
  meta: string[];
  /** the explanation proper */
  body: string;
  /** the line the figure's stone is given to speak */
  talk: string;
}

export const STATUE_LORE: Record<string, StatueLore> = {
  hermes: {
    name: 'Hermes Trismegistus',
    glyph: '☿',
    meta: ['Thrice-great', 'Corpus Hermeticum, c. 100–300 CE', 'The Emerald Tablet', 'Patron of the Art'],
    body:
      'The composite figure the whole hermetic tradition hangs from — the Greek Hermes fused with the Egyptian Thoth and then given a human biography as an ancient Egyptian sage. The texts ascribed to him were taken in the Renaissance for a wisdom older than Moses: Ficino broke off translating Plato in 1463 to render them first for Cosimo de’ Medici, and that decision put hermetic philosophy near the centre of European learning for a century and a half. Isaac Casaubon dated them by their Greek in 1614 to the first centuries CE — long after Moses, not before him — and the spell broke among scholars, though not among practitioners. The Emerald Tablet he holds is the shorter and stranger text, a few lines first attested in Arabic, carrying the axiom this whole building turns on: that what is above is as what is below.',
    talk: '“They gave me three greatnesses — philosopher, priest, and king — and a book they could not date. Read the tablet. It is shorter than my reputation.”',
  },
  enoch: {
    name: 'Enoch',
    glyph: '✡',
    meta: ['Seventh from Adam', '1 Enoch, c. 300 BCE – 1st c. CE', 'The Watchers · the heavenly tablets', 'Dee & Kelley’s angelic tongue, 1582–89'],
    body:
      'Genesis gives him four verses and then removes him: he walked with God, and was not, for God took him. Everything else grew in that silence. The Book of Enoch — three separate works stitched together, the oldest fragments found among the Dead Sea Scrolls — sends him up through the heavens as a scribe, has him read the tablets on which the ages are already written, and gives the fullest account anywhere of the Watchers: the angels who came down, took wives, and taught metallurgy, cosmetics, sorcery and the reading of the stars, for which the flood was the correction. That myth is the seed of most later Western demonology, and it explains why the book was dropped from the canon almost everywhere except Ethiopia, where the Orthodox Tewahedo Church has kept it as scripture all along. Europe read it only in fragments until James Bruce brought Ge’ez manuscripts back from Ethiopia in 1773. By then Enoch had already been claimed twice over — as the inventor of writing and astronomy, the Jewish counterpart to the Hermes standing opposite him here, and as the patron of John Dee and Edward Kelley’s scrying, whose recovered angelic language is still called Enochian.',
    talk: '“I was taken up and shown the tablets, and I wrote what was on them. Note what the angels taught below: how to work metal, and paint a face, and read the stars. You are still doing all three.”',
  },
  leontocephaline: {
    name: 'Leontocephaline',
    glyph: '⧖',
    meta: ['The lion-headed god', 'Mithraic mithraea, 2nd–4th c. CE', 'Serpent · wings · keys · sceptre', 'Named nowhere by the cult itself'],
    body:
      'The strangest figure to survive from the Roman mysteries of Mithras: a naked man’s body with a lion’s head, wound from ankle to crown by a serpent, wings at the shoulders, a key in each hand and a sceptre at the side, standing on a globe crossed by two circles. Something like fifty examples are known, most from the mithraea themselves, where the figure stood apart from the bull-slaying relief that every such temple centred on. Not one of them tells us his name. The cult left no scripture, so every identification is an inference from the attributes: Aion or unbounded Time, because the serpent’s coils are read as the sun’s track through the year and the globe as the cosmos; Zurvan, the Zoroastrian Time in whom the twin spirits are begotten, on the strength of the cult’s claimed Persian descent; Ahriman, because one dedication at York is inscribed to him; or simply a guardian of the gate, given the keys. The crossed circles on his globe are the celestial equator and the ecliptic, which is why he keeps turning up in modern arguments — after David Ulansey — that the whole cult encoded a piece of astronomy. He earns this pier as the clearest surviving image of a doctrine that was deliberately never written down: everything about him is legible except what he means.',
    talk: '“Seven coils, two keys, one globe, and no name. My initiates were forbidden to write any of it down, and they obeyed. You are looking at what obedience costs.”',
  },
  isis: {
    name: 'Isis',
    glyph: '𓊨',
    meta: ['Throne of the mysteries', 'Egyptian, then Graeco-Roman', 'Sister-wife of Osiris', 'Isis Unveiled, 1877'],
    body:
      'The Egyptian goddess whose cult, alone among Egypt’s, conquered the Greek and Roman worlds — mysteries of hers were kept from Alexandria to Londinium, and Apuleius closes The Golden Ass with an initiation into them, the fullest first-hand account of any ancient mystery religion to survive. She was the great magician of the Osiris myth, gathering her murdered husband’s scattered body and reviving him long enough to conceive Horus: a death-and-resurrection at the centre of a mystery cult, which is exactly why later Western esotericism kept reaching for her. Plutarch made her the receptive matter to Osiris’s form; the Renaissance read her veiled statue at Saïs — "no mortal has lifted my veil" — as the emblem of hidden nature herself, the phrase every later occultist quotes. When Blavatsky launched modern Theosophy in 1877 she called the book Isis Unveiled, and the Golden Dawn built her into its grade-work. The Isis of this wall is less a single goddess than the West’s standing name for the veil over the secret.',
    talk: '“I am all that has been and is and shall be, and no mortal has lifted my veil. They keep writing that they have. Read on.”',
  },
  serapis: {
    name: 'Serapis',
    glyph: '𓁶',
    meta: ['Graeco-Egyptian god', 'Instituted under Ptolemy I, c. 300 BCE', 'Osiris + Apis, in Greek form', 'Modius crown · Cerberus'],
    body:
      'A god made on purpose. Ptolemy I, ruling Egypt after Alexander, wanted a deity his Greek and Egyptian subjects could worship together, and Serapis was the result — the Egyptian Osiris-Apis (the dead Apis bull identified with Osiris) given a wholly Greek body: bearded, enthroned, robed like Zeus, with the grain-measure modius on his head and the hound Cerberus at his feet, so that he read at once as Osiris, Zeus, Hades, Asklepios and the sun. The Serapeum of Alexandria became one of the ancient world’s great temples and, with its daughter library, one of its great houses of learning, until a Christian mob destroyed it in 391 CE. He is the clearest case in this whole museum of deliberate syncretism — a state-engineered fusion of two religions — which is why he stands opposite Isis at the door of the study: the pair whose joint cult actually carried the Egyptian mysteries into the Western imagination. He surfaces again at the far end of the tradition as "Master Serapis" of Blavatsky’s Theosophy, the ancient god pressed back into service by the modern revival.',
    talk: '“A king needed one god for two peoples, so his priests built me from an Egyptian bull and a Greek throne. You are looking at religion made by committee — and it worked for six hundred years.”',
  },
  thoth: {
    name: 'Thoth',
    glyph: '⚖',
    meta: ['Egyptian god of writing', 'Scribe at the weighing of the heart', 'Ibis and baboon', 'Hermes’ elder self'],
    body:
      'The Egyptian god of writing, reckoning and the moon, who gave men the script and who stands at the judgement of the dead to record the weighing of the heart against the feather of truth. Greeks living in Egypt identified him with their own Hermes almost on sight — the interpretatio graeca that eventually produced the Hermes Trismegistus standing further along this wall — and the identification was old enough and complete enough that Cicero could list five Mercuries and hand the fifth to the Egyptians. He is the reason the hermetic tradition can claim Egyptian antiquity at all. Whatever the Corpus Hermeticum actually is, it was written in the shadow of a god whose defining act was to make things permanent by writing them down.',
    talk: '“I invented the letters. Everything you have read in this building is, in the last account, my fault.”',
  },
  prometheus: {
    name: 'Prometheus',
    glyph: '🜂',
    meta: ['Titan of forethought', 'Hesiod, Theogony & Works and Days', 'Aeschylus, Prometheus Bound', 'The stolen fire · the eagle'],
    body:
      'The Titan whose name means forethought, who took fire from the gods in a hollow fennel stalk and gave it to a species that had been meant to do without it, and who was chained to a rock in the Caucasus for it while an eagle ate his liver daily. Hesiod tells it as a story about the cost of cleverness; Aeschylus turns him into something else entirely, a sufferer who will not recant before a tyrant, and it is Aeschylus’ version the modern world kept. Fire here is never only fire — it is the arts, the crafts, medicine, number and letters, everything that lets a mortal alter the conditions he was handed. That is why the alchemists and the Renaissance magi claimed him, and why the Romantics did too: Shelley freed him, and Mary Shelley subtitled Frankenstein “the Modern Prometheus” as a warning about the same act. He belongs in this library as its patron of transgressive knowledge — the argument, still unsettled, over whether there are things it is impious to learn.',
    talk: '“I gave you fire and every art that comes with it, and I am still on this rock. Use them better than the gods expected, and the sentence will have been worth serving.”',
  },
  sophia: {
    name: 'Sophia',
    glyph: '🕊',
    meta: ['Wisdom personified', 'Proverbs 8', 'Gnostic cosmology, 2nd c. CE', 'Boehme’s visions, c. 1600'],
    body:
      'Wisdom as a person rather than a quality. In Proverbs she says she was beside God at the founding of the world, delighting, before anything was made. The Gnostic schools of the second century took that figure and gave her a fall: the last and most distant of the divine emanations, she reaches beyond her measure, and the material world with its flawed maker is the wreckage — which makes salvation a matter of knowledge, gnosis, rather than obedience, and which is precisely why the heresiologists went after them. The idea does not die with the Gnostics. Jacob Boehme, a shoemaker in Görlitz, met her in visions around 1600 and made her the centre of a Christian theosophy that runs through the Behmenists to William Blake; Russian sophiology was still arguing about her in the twentieth century.',
    talk: '“I was there before the beginning, and I am still the part of the story that no one can quite place.”',
  },
  melchizedek: {
    name: 'Melchizedek',
    glyph: '☩',
    meta: ['King of Salem, priest of God Most High', 'Genesis 14 · Psalm 110', 'Bread and wine · the tithe of Abram', '11QMelchizedek, Qumran'],
    body:
      'Three verses in Genesis, and almost nothing else. A king of Salem and priest of God Most High comes out to Abram returning from battle, brings bread and wine, blesses him, and takes a tenth of everything — then leaves the narrative entirely. Psalm 110 revives him as the pattern of an eternal priesthood, and the Epistle to the Hebrews builds the whole of its argument on what Genesis omits: no father, no mother, no genealogy, no beginning of days nor end of life. That is an argument from silence and Hebrews knows it, which is precisely why the figure proved so useful — a priesthood older than Aaron and independent of descent. The Qumran library found him stranger still: 11QMelchizedek makes him a heavenly deliverer who presides over the last judgement and proclaims liberty in the final jubilee, an elohim in his own right rather than a Canaanite priest-king. There is a Gnostic tractate under his name at Nag Hammadi, a sect Epiphanius accuses of ranking him above Christ, and a birth narrative in 2 Enoch where he is born already marked and carried to Eden ahead of the flood — which ties him to the figure standing across this rotunda. He earns his place here as the tradition’s cleanest case of an argument built on an absence: what the text does not say about him became, for two thousand years, the most important thing about him.',
    talk: '“Bread, wine, a blessing, a tenth part — and then the scribes closed the book on me. Everything you have been told since was reasoned from what is missing.”',
  },
  zoroaster: {
    name: 'Zoroaster',
    glyph: '🜂',
    meta: ['Zarathustra of Persia', 'Prophet of the fire', 'Chaldean Oracles (misattributed)', 'One of Ficino’s ancient theologians'],
    body:
      'The Iranian prophet who taught a cosmos divided between a wise lord and a hostile spirit, with fire kept as the pure sign of the truth — which is why the tradition remembers him at an altar flame. The West mostly did not read him straight. The Renaissance Platonists made him the eldest of the prisci theologi, the “ancient theologians” who were held to have received one primordial wisdom before Plato; Gemistos Plethon and Marsilio Ficino set him at the head of that line, beside the Hermes and the Orpheus who stand along this same wall. The Chaldean Oracles — hexameter fragments actually composed in the second century CE — were fathered onto him and read for centuries as his. He is the clearest case in this library of a real historical teacher all but buried under the authority that later ages needed him to carry.',
    talk: '“Persia knew me as a prophet of the fire. Florence recast me as the oldest sage of all. Warm your hands, and ask which of us you have come to meet.”',
  },
  orpheus: {
    name: 'Orpheus',
    glyph: '♪',
    meta: ['The Orphic mysteries', 'The gold leaves, 4th c. BCE', 'The Orphic Hymns', 'Ficino’s Orphic singing'],
    body:
      'The singer who went down after his wife and came back without her, and the name attached to a body of poetry and initiation stretching across a thousand years. Orphism matters more than the other mysteries in this library’s story for a plain reason: it left texts — cosmogonies, the Orphic Hymns, and the gold leaves buried with initiates giving directions for the road after death. Its doctrine that the soul is immortal, imprisoned in the body, and works out a long cycle of rebirths reaches Plato, and by way of Plato reaches everything downstream of him in these halls. Ficino, who translated the Hermetica for Cosimo, also sang the Orphic Hymns to his own lyre accompaniment as a working practice, holding that the right song at the right hour drew down planetary influence. The lyre cut into this shaft is not ornament. It was equipment.',
    talk: '“I did look back. Sing the hymn properly and you may manage better than I did.”',
  },
};
