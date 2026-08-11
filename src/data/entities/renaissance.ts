import type { Entity } from '../../domain/types';

export const renaissance: Entity[] = [
  {
    id: 'marsilio-ficino',
    type: 'person',
    name: 'Marsilio Ficino',
    epithet: 'The Florentine who gave Plato and Hermes back to Europe',
    dates: '1433–1499',
    year: 1470,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Physician’s son, priest, and philosopher under Medici patronage, whose Latin translations of Plato, Plotinus, and the Hermetica — and his gentle astral medicine — shaped a century of thought.',
    claims: [
      {
        text: 'At Cosimo de’ Medici’s request, Ficino set aside his Plato in 1463 to translate the newly arrived Corpus Hermeticum first; the version was printed in 1471.',
        evidence: 'documented',
        sources: ['yates-1964', 'copenhaver-1992'],
      },
      {
        text: 'His De vita libri tres (1489) elaborated a medicine of the spirit, drawing down celestial influences through music, scent, diet, and talismans.',
        evidence: 'documented',
        sources: ['walker-1958'],
      },
      {
        text: 'D. P. Walker traced how Ficino’s “spiritual magic” tried to stay within natural, non-demonic bounds — a line his successors did not always hold.',
        evidence: 'scholarship',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'translated', target: 'corpus-hermeticum' },
      { kind: 'associated-with', target: 'florence' },
      { kind: 'influenced', target: 'pico-della-mirandola' },
      { kind: 'associated-with', target: 'natural-magic' },
    ],
    tags: ['florence', 'plato', 'translation', 'de vita', 'medici'],
  },
  {
    id: 'ficino-translation',
    type: 'event',
    name: 'Hermes Comes to Florence',
    epithet: 'A monk’s manuscript changes the Renaissance',
    dates: 'c. 1460–1471',
    year: 1463,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The arrival of a Greek Hermetic manuscript in Florence and Ficino’s swift Latin translation — the episode that put “most ancient wisdom” at the centre of Renaissance philosophy.',
    claims: [
      {
        text: 'Around 1460 the monk Leonardo of Pistoia brought a Greek manuscript of the Hermetica to Cosimo de’ Medici; Ficino completed his Latin draft in 1463.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
      {
        text: 'Yates opened her 1964 study with this episode, emblematic of the authority the Renaissance granted to presumed ancient wisdom.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'marsilio-ficino' },
      { kind: 'associated-with', target: 'corpus-hermeticum' },
      { kind: 'located-in', target: 'florence' },
    ],
    tags: ['translation', 'cosimo', 'manuscript', '1463'],
  },
  {
    id: 'pico-della-mirandola',
    type: 'person',
    name: 'Giovanni Pico della Mirandola',
    epithet: 'The young count who challenged all comers with 900 theses',
    dates: '1463–1494',
    year: 1486,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The prodigy of the Florentine circle who wove scholastic, Platonic, Hermetic, and kabbalistic learning into a single audacious synthesis — and drew Kabbalah into Christian argument.',
    claims: [
      {
        text: 'In December 1486, aged twenty-three, Pico published nine hundred theses in Rome and invited scholars to dispute them; the oration later titled “On the Dignity of Man” was drafted as its opening address.',
        evidence: 'documented',
        sources: ['farmer-1998'],
      },
      {
        text: 'A papal commission condemned thirteen theses in 1487, and the whole collection was banned.',
        evidence: 'documented',
        sources: ['farmer-1998'],
      },
      {
        text: 'Pico’s theses drew kabbalistic method into Christian argument — the founding gesture of Christian Cabala.',
        evidence: 'scholarship',
        sources: ['farmer-1998', 'yates-1964'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'nine-hundred-theses' },
      { kind: 'studied', target: 'kabbalah' },
      { kind: 'influenced', target: 'johannes-reuchlin' },
      { kind: 'associated-with', target: 'florence' },
      { kind: 'associated-with', target: 'christian-cabala' },
    ],
    tags: ['dignity of man', 'theses', 'syncretism', 'florence'],
  },
  {
    id: 'nine-hundred-theses',
    type: 'event',
    name: 'The 900 Theses',
    epithet: 'An invitation to dispute everything, 1486',
    dates: 'December 1486',
    year: 1486,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Pico’s nine hundred propositions spanning scholastic, Platonic, Hermetic, and kabbalistic sources, printed in Rome — the public disputation he sought never took place.',
    claims: [
      {
        text: 'Nine hundred propositions drawing on scholastic, Arabic, Platonic, Hermetic, and kabbalistic sources were printed in Rome in December 1486; the planned disputation was never held.',
        evidence: 'documented',
        sources: ['farmer-1998', 'pico-1486'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'pico-della-mirandola' }],
    tags: ['1486', 'disputation', 'rome'],
  },
  {
    id: 'johannes-reuchlin',
    type: 'person',
    name: 'Johannes Reuchlin',
    epithet: 'The Christian Hebraist who defended the books',
    dates: '1455–1522',
    year: 1517,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The leading Christian Hebraist of his generation, author of the first systematic Christian treatises on Kabbalah, and defender of Jewish books against confiscation.',
    claims: [
      {
        text: 'Reuchlin published De verbo mirifico (1494) and De arte cabalistica (1517), the first systematic Christian treatises on Kabbalah.',
        evidence: 'documented',
        sources: ['reuchlin-1517', 'scholem-1941'],
      },
      {
        text: 'He publicly opposed the confiscation and destruction of Jewish books in the controversy that convulsed German humanism in the 1510s.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'christian-cabala' },
      { kind: 'studied', target: 'kabbalah' },
    ],
    tags: ['hebraist', 'de arte cabalistica', 'humanism'],
  },
  {
    id: 'christian-cabala',
    type: 'tradition',
    name: 'Christian Cabala',
    epithet: 'Kabbalah re-read through Christian eyes',
    dates: 'from the 1480s',
    year: 1490,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Renaissance current that re-read kabbalistic technique as confirmation of Christian doctrine, from Pico and Reuchlin through Agrippa into later esoteric synthesis.',
    claims: [
      {
        text: 'Christian Cabala re-read kabbalistic technique as confirmation of Christian doctrine — most famously in arguments that the name of Jesus perfected the divine name.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'scholem-1941'],
      },
      {
        text: 'From Pico and Reuchlin it passed into Agrippa’s synthesis and onward into Rosicrucian and later occult currents.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'kabbalah' },
      { kind: 'influenced', target: 'cornelius-agrippa' },
      { kind: 'influenced', target: 'golden-dawn' },
    ],
    tags: ['renaissance', 'names', 'synthesis'],
  },
  {
    id: 'cornelius-agrippa',
    type: 'person',
    name: 'Heinrich Cornelius Agrippa',
    epithet: 'The soldier-scholar who systematized magic — then doubted everything',
    dates: '1486–1535',
    year: 1533,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The restless German polymath whose De occulta philosophia became the standard early modern compendium of magic, and whose declaration of the vanity of all sciences still puzzles his readers.',
    claims: [
      {
        text: 'Agrippa drafted De occulta philosophia by 1510 and printed the full three books in 1533, arranging magic into natural, celestial, and ceremonial registers.',
        evidence: 'documented',
        sources: ['agrippa-1533', 'walker-1958'],
      },
      {
        text: 'His On the Uncertainty and Vanity of the Sciences (1530) declared human learning vain; how it squares with his magical summa remains a scholarly debate.',
        evidence: 'scholarship',
        sources: ['walker-1958', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'three-books-of-occult-philosophy' },
      { kind: 'studied', target: 'christian-cabala' },
      { kind: 'influenced', target: 'john-dee' },
      { kind: 'influenced', target: 'eliphas-levi' },
    ],
    tags: ['occult philosophy', 'nettesheim', 'compendium'],
  },
  {
    id: 'three-books-of-occult-philosophy',
    type: 'work',
    name: 'Three Books of Occult Philosophy',
    epithet: 'The great compendium of Renaissance magic',
    dates: '1533',
    year: 1533,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Agrippa’s summa of magic — natural, celestial, and ceremonial — whose tables of correspondences supplied working material to magicians for centuries.',
    claims: [
      {
        text: 'The three books cover natural, celestial (mathematical), and ceremonial magic, printed complete at Cologne in 1533.',
        evidence: 'documented',
        sources: ['agrippa-1533'],
      },
      {
        text: 'Its tables of correspondences — numbers, planets, stones, and names — became a standard reference for later magical writers.',
        evidence: 'scholarship',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'correspondences' },
      { kind: 'influenced', target: 'golden-dawn' },
    ],
    tags: ['magic', 'compendium', 'correspondences', 'cologne'],
  },
  {
    id: 'john-dee',
    type: 'person',
    name: 'John Dee',
    epithet: 'Elizabeth’s philosopher, keeper of England’s greatest library',
    dates: '1527–1608/9',
    year: 1580,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Mathematician, imperial adviser, and natural philosopher whose library at Mortlake was among the largest in England — and whose angelic conversations sought a universal science of nature.',
    claims: [
      {
        text: 'Dee assembled at Mortlake one of the largest libraries in Elizabethan England and advised on navigation, calendar reform, and imperial policy.',
        evidence: 'documented',
        sources: ['harkness-1999'],
      },
      {
        text: 'From 1582, with the scryer Edward Kelley, he recorded “angelic conversations” in dozens of notebooks — practices Harkness reads as an attempted universal science of nature.',
        evidence: 'documented',
        sources: ['harkness-1999'],
      },
      {
        text: 'He travelled through Central Europe in 1583–89, including audiences at Rudolf II’s Prague.',
        evidence: 'documented',
        sources: ['harkness-1999'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'monas-hieroglyphica' },
      { kind: 'associated-with', target: 'prague' },
      { kind: 'associated-with', target: 'london' },
      { kind: 'influenced', target: 'golden-dawn', note: 'his angelic material became the order’s “Enochian” system' },
    ],
    tags: ['mortlake', 'library', 'angelic conversations', 'enochian', 'elizabethan'],
  },
  {
    id: 'monas-hieroglyphica',
    type: 'work',
    name: 'Monas Hieroglyphica',
    epithet: 'One glyph to bind the heavens',
    dates: '1564',
    year: 1564,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Dee’s dense little book expounding a single hieroglyph — compounding lunar, solar, elemental, and zodiacal signs — through twenty-four theorems.',
    claims: [
      {
        text: 'Printed at Antwerp in 1564, the book expounds a single glyph compounding lunar, solar, elemental, and zodiacal signs through twenty-four “theorems”.',
        evidence: 'documented',
        sources: ['dee-1564'],
      },
      {
        text: 'Dee claimed the glyph contained a revolution in knowledge that he never fully explained; interpreters have puzzled over it from his day to ours.',
        evidence: 'scholarship',
        sources: ['harkness-1999'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'correspondences' }],
    tags: ['glyph', 'antwerp', 'theorems', 'symbol'],
  },
  {
    id: 'giordano-bruno',
    type: 'person',
    name: 'Giordano Bruno',
    epithet: 'The Nolan who preached infinite worlds',
    dates: '1548–1600',
    year: 1590,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The ex-Dominican philosopher of infinite worlds and prodigious memory arts, who wandered the courts of Europe and died at the stake in Rome in 1600.',
    claims: [
      {
        text: 'Bruno taught an infinite universe of innumerable worlds and an art of memory of vast ambition, moving among courts and universities across Europe.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
      {
        text: 'Arrested by the Venetian Inquisition in 1592 and transferred to Rome, he was burned at Campo de’ Fiori on 17 February 1600.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
      {
        text: 'Yates cast him as a “Hermetic magician”; subsequent scholarship has qualified how far Hermeticism explains his cosmology.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'hermeticism' },
      { kind: 'associated-with', target: 'bruno-execution' },
      { kind: 'associated-with', target: 'prague' },
    ],
    tags: ['infinite worlds', 'memory', 'nola', 'inquisition'],
  },
  {
    id: 'bruno-execution',
    type: 'event',
    name: 'The Execution of Giordano Bruno',
    epithet: 'Campo de’ Fiori, 17 February 1600',
    dates: '1600',
    year: 1600,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'After an eight-year trial, Bruno was burned as a heretic in Rome — an event whose meaning has been contested ever since.',
    claims: [
      {
        text: 'After an eight-year trial, Bruno was burned as a heretic at Campo de’ Fiori in Rome on 17 February 1600; the final charges survive only in part.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
      {
        text: 'His nineteenth-century elevation as a martyr of free thought layered a new interpretation over the early modern record.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'giordano-bruno' }],
    tags: ['1600', 'rome', 'inquisition', 'martyrdom'],
  },
  {
    id: 'florence',
    type: 'place',
    name: 'Florence',
    epithet: 'The city where Plato spoke Latin again',
    year: 1470,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Medici city whose patronage turned Greek manuscripts into a philosophical movement — the workshop of the Renaissance Platonic revival.',
    claims: [
      {
        text: 'Under Medici patronage, Florence became the workshop in which Plato, Plotinus, and the Hermetica were turned into Latin and into a movement.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'marsilio-ficino' },
      { kind: 'associated-with', target: 'ficino-translation' },
    ],
    tags: ['medici', 'tuscany', 'patronage'],
  },
  {
    id: 'prague',
    type: 'place',
    name: 'Prague',
    epithet: 'Rudolf II’s capital of curiosities',
    year: 1585,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Under Emperor Rudolf II, a magnet for alchemists, astronomers, and magi from across Europe — the great court of esoteric patronage.',
    claims: [
      {
        text: 'The court of Emperor Rudolf II (r. 1576–1612) drew alchemists, astronomers, and magi — Dee and Kelley among them — making Prague a capital of esoteric patronage.',
        evidence: 'documented',
        sources: ['harkness-1999', 'principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'john-dee' },
      { kind: 'associated-with', target: 'voynich-manuscript' },
    ],
    tags: ['rudolf ii', 'bohemia', 'court', 'patronage'],
  },
  {
    id: 'correspondences',
    type: 'concept',
    name: 'The Doctrine of Correspondences',
    epithet: 'As above, so below',
    year: 1533,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The idea that all levels of reality mirror one another — stars, stones, plants, and the human body linked by hidden sympathies — the load-bearing wall of esoteric cosmology.',
    claims: [
      {
        text: 'The doctrine that all levels of reality mirror one another, linked by hidden sympathies, underlies talismanic magic and much esoteric cosmology.',
        evidence: 'scholarship',
        sources: ['faivre-1994', 'walker-1958'],
      },
      {
        text: 'Antoine Faivre made “correspondences” the first of his four intrinsic characteristics of Western esotericism.',
        evidence: 'scholarship',
        sources: ['faivre-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'emerald-tablet' },
      { kind: 'associated-with', target: 'natural-magic' },
    ],
    tags: ['sympathy', 'macrocosm', 'microcosm'],
  },
  {
    id: 'natural-magic',
    type: 'concept',
    name: 'Natural Magic',
    epithet: 'Working with the hidden virtues of things',
    year: 1500,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Magia naturalis claimed to operate through hidden but natural powers — a category early modern writers used to defend their art as philosophy rather than sorcery.',
    claims: [
      {
        text: 'Natural magic claimed to work through hidden but natural virtues of things, distinguishing itself from demonic magic — a boundary policed anxiously in theory and often blurred in practice.',
        evidence: 'scholarship',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'marsilio-ficino' },
      { kind: 'associated-with', target: 'cornelius-agrippa' },
    ],
    tags: ['magia naturalis', 'sympathies', 'philosophy'],
  },
  {
    id: 'pentagram',
    type: 'symbol',
    name: 'The Pentagram',
    epithet: 'The five-pointed star of the microcosm',
    year: 1533,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The five-pointed star, given its enduring esoteric form when Agrippa bound it to the human microcosm — and given its moral polarity only in the nineteenth century.',
    claims: [
      {
        text: 'Agrippa printed the figure of a human body inscribed in a pentagram, binding the star to the proportions of the microcosm.',
        evidence: 'documented',
        sources: ['agrippa-1533'],
      },
      {
        text: 'Éliphas Lévi distinguished upright from inverted pentagrams in the 1850s — the moral polarity attached to orientation is a nineteenth-century development.',
        evidence: 'documented',
        sources: ['levi-1856'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'three-books-of-occult-philosophy' },
      { kind: 'associated-with', target: 'eliphas-levi' },
    ],
    tags: ['star', 'microcosm', 'five'],
  },
  {
    id: 'cosimo-de-medici',
    type: 'person',
    name: 'Cosimo de’ Medici',
    epithet: 'The banker who ordered Hermes before Plato',
    dates: '1389–1464',
    year: 1462,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Florentine patriarch whose patronage founded the Platonic revival — and who, with a year to live, told Ficino to set Plato aside until Hermes was translated.',
    claims: [
      {
        text: 'Cosimo commissioned Ficino’s translations and granted him a villa at Careggi; Ficino records being ordered to translate the Corpus Hermeticum first.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'patron-of', target: 'marsilio-ficino' },
      { kind: 'associated-with', target: 'florence' },
    ],
    tags: ['medici', 'patronage', 'careggi'],
  },
  {
    id: 'de-vita-libri-tres',
    type: 'work',
    name: 'De Vita Libri Tres',
    epithet: 'Three books on drawing life down from the stars',
    dates: '1489',
    year: 1489,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Ficino’s manual of learned self-care, whose third book — On Obtaining Life from the Heavens — teaches the tempering of spirit through music, scents, and talismanic images.',
    claims: [
      {
        text: 'De vita coelitus comparanda expounds a natural, spiritual magic of attracting celestial influence, drawing on the Asclepius and Picatrix.',
        evidence: 'scholarship',
        sources: ['walker-1958', 'yates-1964'],
      },
      {
        text: 'Ficino hedged the work with protestations of orthodoxy, anxious about its talismanic content.',
        evidence: 'scholarship',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'marsilio-ficino' },
      { kind: 'derived-from', target: 'picatrix' },
    ],
    tags: ['spiritus', 'music', 'talismans'],
  },
  {
    id: 'oration-on-dignity-of-man',
    type: 'work',
    name: 'Oration on the Dignity of Man',
    epithet: 'The manifesto of the self-fashioning soul',
    dates: '1486',
    year: 1487,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Pico’s unspoken opening speech for his Roman disputation: God tells Adam he may sculpt himself into beast or angel — with magic and Kabbalah among the arts of ascent.',
    claims: [
      {
        text: 'The Oration was written to open the disputation of the 900 theses and remained unpublished in Pico’s lifetime.',
        evidence: 'documented',
        sources: ['farmer-1998'],
      },
      {
        text: 'Its label as “manifesto of the Renaissance” is a modern coinage of Burckhardtian historiography.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'pico-della-mirandola' },
      { kind: 'associated-with', target: 'nine-hundred-theses' },
    ],
    tags: ['dignity', 'adam', '1486'],
  },
  {
    id: 'pico-condemnation',
    type: 'event',
    name: 'The Condemnation of Pico’s Theses',
    epithet: 'Rome answers the boldest syllabus in Europe',
    dates: '1487',
    year: 1487,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Innocent VIII’s commission condemns thirteen of Pico’s nine hundred theses; the whole set is burned, the author flees — the first printed book universally banned.',
    claims: [
      {
        text: 'A papal commission censured thirteen theses in 1487; Innocent VIII then condemned all nine hundred, and Pico was briefly imprisoned in France.',
        evidence: 'documented',
        sources: ['farmer-1998'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'nine-hundred-theses' },
      { kind: 'associated-with', target: 'pico-della-mirandola' },
    ],
    tags: ['censure', '1487', 'rome'],
  },
  {
    id: 'de-arte-cabalistica',
    type: 'work',
    name: 'De Arte Cabalistica',
    epithet: 'The art of Kabbalah, argued in Greek dialogue',
    dates: '1517',
    year: 1517,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Reuchlin’s mature defence of Kabbalah: a Pythagorean, a Muslim, and a Jew converse on the divine names — Christian Hebraism’s founding classic.',
    claims: [
      {
        text: 'De arte cabalistica (1517) presents Kabbalah as the Jewish counterpart of Pythagorean wisdom, centring on the powers of the divine names.',
        evidence: 'documented',
        sources: ['reuchlin-1517'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'johannes-reuchlin' },
      { kind: 'part-of', target: 'christian-cabala' },
    ],
    tags: ['1517', 'dialogue', 'hebraism'],
  },
  {
    id: 'trithemius',
    type: 'person',
    name: 'Johannes Trithemius',
    epithet: 'The abbot whose cipher-book summoned suspicion',
    dates: '1462–1516',
    year: 1500,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Abbot of Sponheim, bibliophile and cryptographer, teacher of Agrippa — his Steganographia read as angel-magic until its ciphers were solved, and even after.',
    claims: [
      {
        text: 'Trithemius built a famous monastic library and wrote foundational works of cryptography; he advised and taught Agrippa.',
        evidence: 'documented',
        sources: ['copenhaver-2015', 'thorndike-1923'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'steganographia' },
      { kind: 'influenced', target: 'cornelius-agrippa' },
    ],
    tags: ['abbot', 'cryptography', 'sponheim'],
  },
  {
    id: 'steganographia',
    type: 'work',
    name: 'Steganographia',
    epithet: 'Messages carried by spirits — or by cipher',
    dates: 'c. 1500 (printed 1606)',
    year: 1606,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Trithemius’ notorious treatise: instructions for sending messages through planetary spirits that conceal working ciphers — placed on the Index while cryptographers took notes.',
    claims: [
      {
        text: 'The first two books encode cryptographic systems beneath spirit-conjuration language; decipherments were published by 1606 and completed for book III only in the 1990s.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'trithemius' },
      { kind: 'influenced', target: 'john-dee' },
    ],
    tags: ['cipher', 'spirits', 'index'],
  },
  {
    id: 'agrippa-de-vanitate',
    type: 'work',
    name: 'De Vanitate Scientiarum',
    epithet: 'The magus recants — or seems to',
    dates: '1526 (printed 1530)',
    year: 1530,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Agrippa’s declamation on the uncertainty and vanity of all sciences — occult arts included — printed before his occult philosophy, leaving readers to puzzle which voice was sincere.',
    claims: [
      {
        text: 'De vanitate attacks the sciences including magic and cabala, yet Agrippa published De occulta philosophia afterward; scholars debate the relation of the two.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'cornelius-agrippa' },
      { kind: 'associated-with', target: 'three-books-of-occult-philosophy' },
    ],
    tags: ['scepticism', 'declamation'],
  },
  {
    id: 'johann-weyer',
    type: 'person',
    name: 'Johann Weyer',
    epithet: 'Agrippa’s pupil, the witches’ defender',
    dates: '1515–1588',
    year: 1563,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Rhenish physician, trained in Agrippa’s household, whose De praestigiis daemonum argued the accused of witchcraft were deluded and ill, not guilty — mercy argued from medicine.',
    claims: [
      {
        text: 'Weyer lived with Agrippa as a student, and his 1563 De praestigiis daemonum attributed witch-confessions to melancholy and demonic delusion, opposing prosecutions.',
        evidence: 'documented',
        sources: ['copenhaver-2015', 'thomas-1971'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'cornelius-agrippa' },
      { kind: 'wrote', target: 'de-praestigiis-daemonum' },
    ],
    tags: ['physician', 'witch trials', 'mercy'],
  },
  {
    id: 'de-praestigiis-daemonum',
    type: 'work',
    name: 'De Praestigiis Daemonum',
    epithet: 'On the tricks of demons, against the burnings',
    dates: '1563',
    year: 1563,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Weyer’s great treatise against the witch persecutions: the devil deceives, the melancholic confess to impossibilities, and the stake answers neither.',
    claims: [
      {
        text: 'The work argues on medical and theological grounds against the reality of witches’ crimes, provoking Bodin’s furious rebuttal.',
        evidence: 'scholarship',
        sources: ['thomas-1971', 'copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'johann-weyer' },
      { kind: 'influenced', target: 'reginald-scot' },
    ],
    tags: ['1563', 'witchcraft', 'melancholy'],
  },
  {
    id: 'reginald-scot',
    type: 'person',
    name: 'Reginald Scot',
    epithet: 'The Kentish squire who exposed the conjurers',
    dates: 'c. 1538–1599',
    year: 1584,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Author of The Discoverie of Witchcraft (1584): witch-belief anatomized as fraud and delusion, complete with exposures of sleight-of-hand — and, by accident, England’s first conjuring manual.',
    claims: [
      {
        text: 'Scot’s Discoverie catalogued and debunked witchcraft accusations and magical impostures; King James is reported to have ordered it burned.',
        evidence: 'documented',
        sources: ['thomas-1971'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'renaissance-magic' },
      { kind: 'influenced', target: 'natural-magic', note: 'by way of exposure' },
    ],
    tags: ['1584', 'scepticism', 'legerdemain'],
  },
  {
    id: 'renaissance-magic',
    type: 'tradition',
    name: 'Renaissance Magic',
    epithet: 'The learned magic of the humanists',
    dates: 'c. 1460–1600',
    year: 1500,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The current that runs from Ficino’s Florence through Agrippa to Dee and Bruno: magic rebuilt on Hermes, Plato, and Kabbalah as the crown of natural philosophy.',
    claims: [
      {
        text: 'Yates traced a coherent Hermetic-Cabalist tradition of learned magic from Ficino and Pico through Agrippa, Dee, and Bruno.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
      {
        text: 'Later scholarship has qualified the unity of the “Yates thesis” while confirming the currents it described.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012', 'copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'hermeticism' },
      { kind: 'associated-with', target: 'marsilio-ficino' },
    ],
    tags: ['learned magic', 'humanism'],
  },
  {
    id: 'giambattista-della-porta',
    type: 'person',
    name: 'Giambattista della Porta',
    epithet: 'The Neapolitan who staged nature’s secrets',
    dates: 'c. 1535–1615',
    year: 1589,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Playwright and natural magician of Naples, whose Magia Naturalis ran through Europe in dozens of editions — optics, magnets, cosmetics, and wonders as the science of secrets.',
    claims: [
      {
        text: 'Della Porta founded an early scientific academy, the Otiosi, investigated optics including the camera obscura, and expanded Magia Naturalis to twenty books in 1589.',
        evidence: 'documented',
        sources: ['copenhaver-2015', 'thorndike-1923'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'magia-naturalis' },
      { kind: 'part-of', target: 'natural-magic' },
    ],
    tags: ['naples', 'secrets', 'optics'],
  },
  {
    id: 'magia-naturalis',
    type: 'work',
    name: 'Magia Naturalis',
    epithet: 'Natural magic as the encyclopaedia of wonders',
    dates: '1558; expanded 1589',
    year: 1589,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Della Porta’s best-seller of applied wonder: from loadstones and lenses to gardens and distillation — magic defined as the practical knowledge of nature’s sympathies.',
    claims: [
      {
        text: 'Magia Naturalis defines natural magic as the perfection of natural philosophy, and was among the most reprinted scientific books of its age.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'giambattista-della-porta' },
      { kind: 'part-of', target: 'natural-magic' },
    ],
    tags: ['wonders', 'best-seller'],
  },
  {
    id: 'tommaso-campanella',
    type: 'person',
    name: 'Tommaso Campanella',
    epithet: 'The prisoner who sang the City of the Sun',
    dates: '1568–1639',
    year: 1602,
    era: 'early-modern',
    cluster: 'renaissance',
    summary:
      'The Calabrian friar who spent twenty-seven years in Neapolitan dungeons for rebellion — writing utopia and defending Galileo — and ended performing astral magic with a pope.',
    claims: [
      {
        text: 'Campanella wrote La Città del Sole in prison after the failed Calabrian conspiracy of 1599.',
        evidence: 'documented',
        sources: ['walker-1958', 'copenhaver-2015'],
      },
      {
        text: 'In 1628 he conducted sealed-chamber rites with Urban VIII to avert the menace of eclipses — Ficinian magic at the papal court.',
        evidence: 'documented',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'city-of-the-sun' },
      { kind: 'associated-with', target: 'natural-magic' },
    ],
    tags: ['utopia', 'prison', 'urban viii'],
  },
  {
    id: 'city-of-the-sun',
    type: 'work',
    name: 'The City of the Sun',
    epithet: 'A utopia governed by astrologer-priests',
    dates: 'written 1602',
    year: 1602,
    era: 'early-modern',
    cluster: 'renaissance',
    summary:
      'Campanella’s dialogue of the ideal city: seven walled rings painted with all knowledge, ruled by Sun the metaphysician-priest — astrology built into the state itself.',
    claims: [
      {
        text: 'The City of the Sun depicts a communal solar state whose walls form a memory-encyclopaedia and whose rites are timed by the stars.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'walker-1958'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'tommaso-campanella' },
      { kind: 'associated-with', target: 'art-of-memory' },
    ],
    tags: ['utopia', 'solar', 'walls'],
  },
  {
    id: 'girolamo-cardano',
    type: 'person',
    name: 'Girolamo Cardano',
    epithet: 'Gambler, geometer, reader of his own stars',
    dates: '1501–1576',
    year: 1550,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Milanese polymath — algebraist of the cubic, physician, dream-interpreter, astrologer — jailed by the Inquisition for casting the horoscope of Christ.',
    claims: [
      {
        text: 'Cardano published the solution of cubic equations in his Ars Magna and practiced astrology and dream-interpretation; he was imprisoned by the Inquisition in 1570.',
        evidence: 'documented',
        sources: ['thorndike-1923', 'copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'renaissance-magic' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['astrology', 'algebra', 'milan'],
  },
  {
    id: 'guillaume-postel',
    type: 'person',
    name: 'Guillaume Postel',
    epithet: 'The universalist who translated the Zohar for Christendom',
    dates: '1510–1581',
    year: 1550,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The French orientalist and visionary who mastered Arabic and Hebrew, dreamed of world concord under one faith, and produced early Latin renderings of kabbalistic classics.',
    claims: [
      {
        text: 'Postel translated the Sefer Yetzirah and Zoharic material into Latin and preached a universal restitution; he was confined as mad rather than condemned as heretic.',
        evidence: 'documented',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-cabala' },
      { kind: 'translated', target: 'sefer-yetzirah' },
    ],
    tags: ['orientalist', 'concord', 'visionary'],
  },
  {
    id: 'francesco-giorgi',
    type: 'person',
    name: 'Francesco Giorgi',
    epithet: 'The friar who tuned the world like a lute',
    dates: '1466–1540',
    year: 1525,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Venetian Franciscan whose De harmonia mundi wove Kabbalah, Hermes, and Pythagorean number into one world-harmony — and who advised on the proportions of a church.',
    claims: [
      {
        text: 'Giorgi’s De harmonia mundi (1525) synthesizes cabalistic and Hermetic-Pythagorean harmonics; his memorandum shaped the proportions of S. Francesco della Vigna in Venice.',
        evidence: 'documented',
        sources: ['yates-1964', 'hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'de-harmonia-mundi' },
      { kind: 'part-of', target: 'christian-cabala' },
    ],
    tags: ['venice', 'harmony', 'architecture'],
  },
  {
    id: 'de-harmonia-mundi',
    type: 'work',
    name: 'De Harmonia Mundi',
    epithet: 'The world-song in three canticles',
    dates: '1525',
    year: 1525,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Giorgi’s vast harmony of the world: creation as music, scored from the sefirot, the angelic orders, and the proportions of the human body.',
    claims: [
      {
        text: 'The work orders cosmology as musical proportion in three “canticles”, drawing Kabbalah and Hermetica into Christian Platonism.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'francesco-giorgi' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['music', 'proportion', '1525'],
  },
  {
    id: 'agostino-steuco',
    type: 'person',
    name: 'Agostino Steuco',
    epithet: 'The librarian who named the perennial philosophy',
    dates: '1497/8–1548',
    year: 1540,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Vatican librarian and biblical scholar who coined philosophia perennis: the claim that one ancient wisdom, in harmony with Christianity, sounds through all schools and ages.',
    claims: [
      {
        text: 'Steuco’s De perenni philosophia (1540) gave the prisca theologia tradition its enduring name and systematic defence.',
        evidence: 'documented',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'perennial-philosophy' },
      { kind: 'derived-from', target: 'prisca-theologia' },
    ],
    tags: ['vatican', '1540', 'concord'],
  },
  {
    id: 'perennial-philosophy',
    type: 'concept',
    name: 'The Perennial Philosophy',
    epithet: 'One wisdom, sounding through all the ages',
    dates: 'named 1540',
    year: 1540,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The doctrine that a single divine wisdom underlies all true philosophy and religion — named by Steuco, revived by every generation of esotericists since.',
    claims: [
      {
        text: 'The concept descends from Ficino’s prisca theologia through Steuco’s coinage into modern perennialism.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012', 'faivre-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'prisca-theologia' },
      { kind: 'attributed-to', target: 'agostino-steuco' },
    ],
    tags: ['wisdom', 'unity'],
  },
  {
    id: 'horapollo-hieroglyphica',
    type: 'work',
    name: 'The Hieroglyphica of Horapollo',
    epithet: 'Egypt’s signs, misread into a philosophy',
    dates: 'c. 5th c.; found 1419',
    year: 1505,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The late antique treatise on hieroglyphs brought to Florence in 1419 — mostly wrong about Egyptian, and mother of the Renaissance cult of the symbolic image.',
    claims: [
      {
        text: 'A manuscript of Horapollo purchased in 1419 fed the Renaissance conviction that hieroglyphs encode pure philosophical ideas; the Aldine edition appeared in 1505.',
        evidence: 'documented',
        sources: ['copenhaver-2015', 'hanegraaff-2005'],
      },
      {
        text: 'The emblem books of the sixteenth century grow from this symbolic reading of Egypt.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'influenced', target: 'hypnerotomachia-poliphili' },
      { kind: 'associated-with', target: 'hermes-trismegistus' },
    ],
    tags: ['hieroglyphs', 'emblems', '1419'],
  },
  {
    id: 'hypnerotomachia-poliphili',
    type: 'work',
    name: 'Hypnerotomachia Poliphili',
    epithet: 'The strife of love in a dream of ruins',
    dates: '1499',
    year: 1499,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The most beautiful printed book of the Renaissance: Poliphilo’s dream-quest through gardens, temples, and invented hieroglyphs — Aldus Manutius’ typographic masterpiece.',
    claims: [
      {
        text: 'Printed by Aldus in Venice in 1499 with 172 woodcuts, the Hypnerotomachia embeds pseudo-hieroglyphic inscriptions and initiatory architecture; an acrostic names Francesco Colonna.',
        evidence: 'documented',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'horapollo-hieroglyphica' },
      { kind: 'part-of', target: 'renaissance-magic' },
    ],
    tags: ['aldine', 'dream', 'woodcuts'],
  },
  {
    id: 'art-of-memory',
    type: 'concept',
    name: 'The Art of Memory',
    epithet: 'Palaces of the mind, stocked with burning images',
    dates: 'antiquity to Bruno',
    year: 1533,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The classical technique of remembering by places and images, which the Renaissance magi transformed into an engine for imprinting the cosmos on the soul.',
    claims: [
      {
        text: 'Yates reconstructed the passage of the rhetorical memory art from antiquity through Camillo and Bruno into a Hermetic discipline.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'giulio-camillo' },
      { kind: 'associated-with', target: 'giordano-bruno' },
    ],
    tags: ['memory', 'loci', 'images'],
  },
  {
    id: 'giulio-camillo',
    type: 'person',
    name: 'Giulio Camillo',
    epithet: 'Builder of the theatre that held all knowledge',
    dates: 'c. 1480–1544',
    year: 1530,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The Venetian famous across Europe for his wooden Memory Theatre — seven tiers under seven planets, promising its user command of everything sayable.',
    claims: [
      {
        text: 'Camillo constructed a wooden memory theatre exhibited to Francis I; contemporaries including Erasmus’ circle reported on it with fascination.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'art-of-memory' },
      { kind: 'associated-with', target: 'renaissance-magic' },
    ],
    tags: ['theatre', 'planets', 'francis i'],
  },
  {
    id: 'de-umbris-idearum',
    type: 'work',
    name: 'De Umbris Idearum',
    epithet: 'The shadows of ideas, wheeled into memory',
    dates: '1582',
    year: 1582,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'Bruno’s first great memory book, dedicated to Henri III: concentric wheels of images by which the mind, ordering shadows, ascends toward the light of the ideas.',
    claims: [
      {
        text: 'De umbris idearum (Paris, 1582) sets out Bruno’s combinatory memory wheels and their Hermetic rationale.',
        evidence: 'documented',
        sources: ['yates-1964', 'rowland-2008'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'giordano-bruno' },
      { kind: 'part-of', target: 'art-of-memory' },
    ],
    tags: ['wheels', 'paris', '1582'],
  },
  {
    id: 'talisman',
    type: 'concept',
    name: 'The Talisman',
    epithet: 'A star’s virtue, sealed in metal and hour',
    dates: 'antiquity through the Renaissance',
    year: 1489,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The engraved image made under elected stars to capture celestial virtue — the hinge on which learned magic turned from philosophy to practice, and orthodoxy to alarm.',
    claims: [
      {
        text: 'Picatrix and Ficino’s De vita transmit the theory of images engraved at astrologically elected times to draw down planetary influence.',
        evidence: 'scholarship',
        sources: ['walker-1958', 'kieckhefer-1989'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'picatrix' },
      { kind: 'part-of', target: 'natural-magic' },
    ],
    tags: ['images', 'astrology', 'engraving'],
  },
  {
    id: 'sigil',
    type: 'symbol',
    name: 'The Sigil',
    epithet: 'A spirit’s name, drawn as a single character',
    dates: 'medieval and Renaissance magic',
    year: 1533,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The characteristic sign of a planet, angel, or spirit — generated from magic squares and name-letters in Agrippa’s tables, and inscribed wherever magic wrote.',
    claims: [
      {
        text: 'De occulta philosophia gives methods for deriving planetary and spirit sigils from magic squares and Hebrew letter-values.',
        evidence: 'documented',
        sources: ['agrippa-1533'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'three-books-of-occult-philosophy' },
      { kind: 'associated-with', target: 'talisman' },
    ],
    tags: ['characters', 'magic squares'],
  },
  {
    id: 'enochian-language',
    type: 'work',
    name: 'The Enochian Language',
    epithet: 'The speech the angels delivered letter by letter',
    dates: '1583–1587',
    year: 1584,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The angelic language and tables received through Kelley’s scrying in Dee’s diaries — nineteen Calls, a script, and grids of letters, still the most elaborate revealed language on record.',
    claims: [
      {
        text: 'Dee’s spirit diaries record an angelic alphabet, invocations, and letter-tables dictated backwards for safety, between 1583 and 1587.',
        evidence: 'primary',
        sources: ['harkness-1999'],
      },
      {
        text: 'The Golden Dawn later built its Enochian magic on Dee’s tables.',
        evidence: 'scholarship',
        sources: ['howe-1972', 'regardie-1940'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'john-dee' },
      { kind: 'associated-with', target: 'edward-kelley' },
      { kind: 'influenced', target: 'golden-dawn' },
    ],
    tags: ['angelic', 'calls', 'tables'],
  },
  {
    id: 'mortlake',
    type: 'place',
    name: 'Mortlake',
    epithet: 'The library that was England’s memory',
    dates: 'Dee’s residence from 1566',
    year: 1583,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'John Dee’s house on the Thames, holding the largest library in England — thousands of volumes, instruments, and the scrying stones — pillaged while he travelled east.',
    claims: [
      {
        text: 'Dee’s Mortlake library, catalogued in 1583 at around 3,000 printed books and 1,000 manuscripts, exceeded the universities’ collections; it was plundered during his absence abroad.',
        evidence: 'documented',
        sources: ['harkness-1999', 'clulee-1988'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'john-dee' },
      { kind: 'located-in', target: 'london' },
    ],
    tags: ['library', 'thames', '1583'],
  },
  {
    id: 'johann-georg-faust',
    type: 'person',
    name: 'Johann Georg Faust',
    epithet: 'The braggart conjurer behind the myth',
    dates: 'c. 1480–c. 1540',
    year: 1520,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The historical wandering magician and astrologer of the German towns — banned, denounced, and half-legendary already in his lifetime — seed of the Faust of the chapbooks.',
    claims: [
      {
        text: 'Scattered records — town bans, letters of Trithemius and Melanchthon’s circle — attest a wandering magus Faustus in early sixteenth-century Germany.',
        evidence: 'documented',
        sources: ['copenhaver-2015', 'hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'faust-legend' },
      { kind: 'part-of', target: 'renaissance-magic' },
    ],
    tags: ['wandering', 'astrologer', 'germany'],
  },
  {
    id: 'faust-legend',
    type: 'concept',
    name: 'The Faust Legend',
    epithet: 'The pact signed in blood, retold forever',
    dates: 'Faustbuch 1587',
    year: 1587,
    era: 'renaissance',
    cluster: 'renaissance',
    summary:
      'The legend of the scholar who sells his soul for knowledge: printed as the Faustbuch in 1587, staged by Marlowe, transfigured by Goethe — the West’s parable of forbidden learning.',
    claims: [
      {
        text: 'The 1587 Frankfurt Historia von D. Johann Fausten fixed the pact narrative; Marlowe’s Doctor Faustus followed within a few years.',
        evidence: 'documented',
        sources: ['hanegraaff-2005'],
      },
      {
        text: 'The legend attached demonic pact and damnation to the figure of the learned magus, shadowing the reputation of magic itself.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'johann-georg-faust' },
      { kind: 'associated-with', target: 'renaissance-magic' },
    ],
    tags: ['pact', 'chapbook', 'marlowe'],
  },
];
