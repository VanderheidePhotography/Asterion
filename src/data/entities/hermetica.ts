import type { Entity } from '../../domain/types';

export const hermetica: Entity[] = [
  {
    id: 'hermes-trismegistus',
    type: 'person',
    name: 'Hermes Trismegistus',
    epithet: 'Thrice-greatest Hermes, the legendary sage of Egypt',
    dates: 'legendary',
    year: 100,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The legendary Greco-Egyptian sage — a fusion of Greek Hermes and Egyptian Thoth — under whose name the Hermetic writings were composed, and whom Renaissance readers revered as a prophet of primordial wisdom.',
    claims: [
      {
        text: 'Ancient and Renaissance readers held Hermes Trismegistus to be a primordial Egyptian sage — for some, a contemporary of Moses — who had received a pristine divine wisdom.',
        evidence: 'legend',
        sources: ['copenhaver-1992', 'yates-1964'],
      },
      {
        text: 'Modern scholarship treats the figure as a Greco-Egyptian literary persona, a fusion of Hermes and Thoth, under whose name anonymous authors of the first centuries CE wrote.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992'],
      },
      {
        text: 'Marsilio Ficino placed Hermes at the head of his genealogy of ancient theologians in the preface to his Latin translation of the Hermetica.',
        evidence: 'documented',
        sources: ['yates-1964', 'copenhaver-1992'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermeticism' },
      { kind: 'associated-with', target: 'alexandria' },
      { kind: 'associated-with', target: 'prisca-theologia' },
    ],
    tags: ['hermes', 'thoth', 'egypt', 'sage', 'legend'],
  },
  {
    id: 'corpus-hermeticum',
    type: 'work',
    name: 'Corpus Hermeticum',
    epithet: 'The Greek treatises that convinced the Renaissance it had found Egypt’s wisdom',
    dates: '2nd–3rd c. CE',
    year: 150,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'A collection of Greek philosophical treatises on God, the cosmos, and the soul’s ascent, attributed to Hermes Trismegistus, composed in Roman Egypt and rediscovered by Renaissance Florence.',
    claims: [
      {
        text: 'The Greek treatises were composed by multiple anonymous authors in Roman Egypt, most likely between the first and third centuries CE.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992'],
      },
      {
        text: 'A Greek manuscript reached Cosimo de’ Medici in Florence around 1460; Marsilio Ficino translated fourteen treatises, and the Latin version was printed in 1471.',
        evidence: 'documented',
        sources: ['yates-1964', 'copenhaver-1992'],
      },
      {
        text: 'Isaac Casaubon demonstrated on philological grounds in 1614 that the treatises postdate Christianity, overturning their claimed antiquity.',
        evidence: 'documented',
        sources: ['casaubon-1614', 'yates-1964'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'hermes-trismegistus' },
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'associated-with', target: 'alexandria' },
    ],
    tags: ['hermetica', 'treatises', 'pimander', 'greek', 'florence'],
  },
  {
    id: 'emerald-tablet',
    type: 'work',
    name: 'The Emerald Tablet',
    epithet: '“That which is above is like that which is below”',
    dates: 'earliest Arabic text, 8th–9th c.',
    year: 800,
    era: 'medieval',
    cluster: 'hermetica',
    summary:
      'A short, cryptic text attributed to Hermes Trismegistus, first attested in Arabic and translated into Latin in the twelfth century, whose axiom of above and below became the motto of alchemy.',
    claims: [
      {
        text: 'The earliest known text of the Emerald Tablet appears in Arabic, embedded in the Sirr al-khalīqa (Book of the Secret of Creation) attributed to Apollonius of Tyana, around the eighth or ninth century.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'Latin translations circulated from the twelfth century, and the maxim “that which is above is like that which is below” became a touchstone of alchemical literature.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'Isaac Newton left an English translation of the Tablet among his alchemical manuscripts.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'hermes-trismegistus' },
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['tabula smaragdina', 'as above so below', 'alchemy', 'arabic'],
  },
  {
    id: 'picatrix',
    type: 'work',
    name: 'Picatrix (Ghāyat al-Ḥakīm)',
    epithet: 'The great Arabic handbook of astral magic',
    dates: '10th–11th c.; Latin 13th c.',
    year: 1000,
    era: 'medieval',
    cluster: 'hermetica',
    summary:
      'An Arabic compendium of astral magic — talismans, planetary spirits, and cosmic sympathies — translated at the court of Alfonso X and hugely influential on Renaissance magical theory.',
    claims: [
      {
        text: 'Composed in Arabic as the Ghāyat al-Ḥakīm (“Goal of the Sage”), a compendium of astral magic drawing on Hermetic and Neoplatonic materials.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2013'],
      },
      {
        text: 'Translated at the court of Alfonso X of Castile in 1256, and thence into Latin, it became a principal channel of learned astral magic into Europe.',
        evidence: 'documented',
        sources: ['walker-1958'],
      },
      {
        text: 'D. P. Walker traced its influence on Renaissance theories of spiritus and talismanic magic, including Ficino’s De vita.',
        evidence: 'scholarship',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'influenced', target: 'marsilio-ficino' },
      { kind: 'influenced', target: 'cornelius-agrippa' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['astral magic', 'talismans', 'arabic', 'alfonso x', 'planets'],
  },
  {
    id: 'alexandria',
    type: 'place',
    name: 'Alexandria',
    epithet: 'The lighthouse city where Greek and Egyptian wisdom mingled',
    year: 150,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The great Mediterranean port of Roman Egypt, whose mixed Greek, Egyptian, and Jewish culture was the seedbed of Hermetic literature and Greco-Egyptian alchemy.',
    claims: [
      {
        text: 'Roman-era Egypt, and Alexandria in particular, was the milieu in which Greek philosophy, Egyptian religion, Jewish thought, and early Christianity intermixed.',
        evidence: 'documented',
        sources: ['copenhaver-1992'],
      },
      {
        text: 'Both the Hermetic treatises and the earliest Greco-Egyptian alchemical writings emerged from this cultural world.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992', 'principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermeticism' },
      { kind: 'associated-with', target: 'alchemy' },
    ],
    tags: ['egypt', 'city', 'library', 'late antiquity'],
  },
  {
    id: 'hermeticism',
    type: 'tradition',
    name: 'Hermeticism',
    epithet: 'The current that flows from the writings of Thrice-Great Hermes',
    dates: '2nd c. CE onward',
    year: 150,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The family of ideas descending from the Hermetic writings: a cosmos alive with divinity, the soul’s ascent through knowledge, and humanity as a great miracle standing between earth and heaven.',
    claims: [
      {
        text: 'Scholars distinguish the technical Hermetica (astrology, alchemy, magic) from the philosophical Hermetica concerned with the soul’s regeneration and ascent.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992', 'hanegraaff-2013'],
      },
      {
        text: 'Frances Yates argued in 1964 that a “Hermetic tradition” energized Renaissance thought; later scholarship refined and qualified the strong form of this thesis.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'prisca-theologia' },
      { kind: 'influenced', target: 'marsilio-ficino' },
      { kind: 'influenced', target: 'rosicrucianism' },
      { kind: 'associated-with', target: 'gnosis' },
    ],
    tags: ['hermetic', 'tradition', 'ascent', 'regeneration'],
  },
  {
    id: 'prisca-theologia',
    type: 'concept',
    name: 'Prisca Theologia',
    epithet: 'The dream of one primordial theology',
    year: 1463,
    era: 'renaissance',
    cluster: 'hermetica',
    summary:
      'The Renaissance conviction that a single pristine theology had been revealed in deep antiquity and handed down through a chain of sages — a genealogy that legitimated pagan wisdom for Christian readers.',
    claims: [
      {
        text: 'Renaissance Platonists held that a pristine theology had descended through a genealogy of sages — Zoroaster, Hermes, Orpheus, Pythagoras, Plato.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'walker-1958'],
      },
      {
        text: 'Ficino set out such genealogies in his prefaces and treatises, presenting pagan wisdom as preparation for Christianity.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'marsilio-ficino' },
      { kind: 'part-of', target: 'hermeticism' },
    ],
    tags: ['ancient theology', 'genealogy', 'zoroaster', 'orpheus'],
  },
  {
    id: 'gnosis',
    type: 'concept',
    name: 'Gnosis',
    epithet: 'Salvific knowledge of divine things',
    year: 200,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Direct, transformative knowledge of the divine — the goal of the philosophical Hermetica and a recurring structural theme across the currents this museum documents.',
    claims: [
      {
        text: 'In the philosophical Hermetica, salvation comes through gnōsis — direct knowledge of God attained by the purified intellect.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992'],
      },
      {
        text: 'Historians of esotericism treat claims to a higher, salvific knowledge as a recurring structural feature of Western esoteric currents.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'associated-with', target: 'kabbalah' },
    ],
    tags: ['knowledge', 'salvation', 'ascent'],
  },
  {
    id: 'isaac-casaubon',
    type: 'person',
    name: 'Isaac Casaubon',
    epithet: 'The philologist who redated Hermes',
    dates: '1559–1614',
    year: 1614,
    era: 'early-modern',
    cluster: 'hermetica',
    summary:
      'The great Huguenot classical scholar whose analysis of the Hermetica’s Greek proved the texts belonged to the early Christian centuries, not primordial Egypt.',
    claims: [
      {
        text: 'In an appendix to his 1614 critique of Baronius’s church history, Casaubon dated the Hermetic treatises to the early Christian centuries by analysing their vocabulary and anachronisms.',
        evidence: 'documented',
        sources: ['casaubon-1614', 'yates-1964'],
      },
      {
        text: 'Yates treated this redating as a hinge of intellectual history — the moment the Renaissance image of ancient Egyptian wisdom lost its scholarly footing.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'critiqued', target: 'corpus-hermeticum' },
      { kind: 'associated-with', target: 'casaubon-dating' },
    ],
    tags: ['philology', 'huguenot', 'dating', 'criticism'],
  },
  {
    id: 'casaubon-dating',
    type: 'event',
    name: 'The Redating of the Hermetica',
    epithet: 'Philology dethrones the most ancient of sages',
    dates: '1614',
    year: 1614,
    era: 'early-modern',
    cluster: 'hermetica',
    summary:
      'Casaubon’s 1614 demonstration that the Hermetic treatises were late antique compositions — a turning point in how Europe weighed the authority of “ancient wisdom”.',
    claims: [
      {
        text: 'Casaubon showed that the treatises quote and echo Greek philosophy and Christian scripture, and could not be the work of a primordial Egyptian sage.',
        evidence: 'documented',
        sources: ['casaubon-1614', 'yates-1964'],
      },
      {
        text: 'Hermetic literature continued to circulate and inspire long after 1614 — the redating changed its scholarly standing, not its readership.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'isaac-casaubon' },
      { kind: 'associated-with', target: 'corpus-hermeticum' },
    ],
    tags: ['philology', '1614', 'turning point'],
  },
  {
    id: 'poimandres',
    type: 'work',
    name: 'Poimandres',
    epithet: 'The shepherd of men opens the corpus',
    dates: 'c. 1st–3rd c. CE',
    year: 150,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The first treatise of the Corpus Hermeticum: a vision in which a great mind, Poimandres, reveals the origin of the cosmos and the ascent of the soul through the planetary spheres.',
    claims: [
      {
        text: 'In the treatise, Hermes receives a cosmogonic vision from Poimandres, “the Mind of Sovereignty”, and is charged to preach the way of rebirth to humanity.',
        evidence: 'primary',
        sources: ['copenhaver-1992'],
      },
      {
        text: 'The text blends Greek philosophy, Jewish scripture, and Egyptian temple theology — the signature mix of Roman-era Alexandria.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'corpus-hermeticum' },
      { kind: 'associated-with', target: 'hermes-trismegistus' },
    ],
    tags: ['vision', 'cosmogony', 'ascent'],
  },
  {
    id: 'asclepius-dialogue',
    type: 'work',
    name: 'The Asclepius',
    epithet: 'The perfect discourse that survived in Latin',
    dates: 'c. 2nd–3rd c. CE',
    year: 250,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The long Hermetic dialogue preserved complete only in Latin, famous for its god-making passage and its lament over the death of Egyptian religion.',
    claims: [
      {
        text: 'The Asclepius circulated in Latin throughout the Middle Ages while the Greek Corpus was lost to the West, keeping Hermes’ name alive.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992', 'ebeling-2007'],
      },
      {
        text: 'Its passage on statues animated by celestial powers was cited by Augustine as idolatry and by Renaissance magi as warrant for talismanic art.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'attributed-to', target: 'hermes-trismegistus' },
      { kind: 'influenced', target: 'natural-magic' },
    ],
    tags: ['latin', 'god-making', 'lament'],
  },
  {
    id: 'thoth',
    type: 'person',
    name: 'Thoth',
    epithet: 'The ibis-headed scribe of the gods',
    dates: 'Egyptian antiquity',
    year: -1500,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Egyptian god of writing, reckoning, and wisdom, whose fusion with the Greek Hermes produced the figure of Hermes Trismegistus.',
    claims: [
      {
        text: 'Greek settlers in Egypt identified their Hermes with Thoth, scribe of the gods and lord of Hermopolis; “thrice-greatest” renders an Egyptian honorific of Thoth.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermes-trismegistus', note: 'the Egyptian half of the fusion' },
      { kind: 'associated-with', target: 'hermopolis' },
    ],
    tags: ['egypt', 'scribe', 'ibis'],
  },
  {
    id: 'hermopolis',
    type: 'place',
    name: 'Hermopolis',
    epithet: 'City of the eight, seat of Thoth',
    year: -1000,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Middle-Egyptian cult city of Thoth (Egyptian Khemenu), whose temple traditions fed the figure of Hermes Trismegistus and whose name the Greeks gave to the god they recognized as their own.',
    claims: [
      {
        text: 'Hermopolis Magna was the principal cult centre of Thoth, whom Greeks called Hermes; its priesthood maintained the mythology of the ogdoad, the eight primordial gods.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'thoth' },
      { kind: 'associated-with', target: 'hermes-trismegistus' },
    ],
    tags: ['egypt', 'cult city', 'ogdoad'],
  },
  {
    id: 'kore-kosmou',
    type: 'work',
    name: 'Korē Kosmou',
    epithet: 'The daughter of the cosmos instructs Horus',
    dates: 'c. 2nd–3rd c. CE',
    year: 250,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'A long Hermetic excerpt preserved by Stobaeus in which Isis teaches Horus the origins of souls and their embodiment — the most mythological of the surviving Hermetica.',
    claims: [
      {
        text: 'The Korē Kosmou survives among the Hermetic excerpts in the anthology of John of Stobi (Stobaeus), cast as Isis’ instruction to her son Horus.',
        evidence: 'documented',
        sources: ['fowden-1986', 'copenhaver-1992'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'stobaean-hermetica' },
      { kind: 'attributed-to', target: 'hermes-trismegistus' },
    ],
    tags: ['isis', 'souls', 'stobaeus'],
  },
  {
    id: 'stobaean-hermetica',
    type: 'work',
    name: 'The Stobaean Hermetica',
    epithet: 'Fragments saved in an anthologist’s net',
    dates: 'anthology c. 5th c. CE',
    year: 450,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Hermetic excerpts preserved in the vast anthology of Stobaeus — dozens of fragments, including the Korē Kosmou, that survive nowhere else.',
    claims: [
      {
        text: 'John of Stobi’s fifth-century anthology preserves some forty Hermetic excerpts independent of the Corpus Hermeticum manuscript tradition.',
        evidence: 'scholarship',
        sources: ['copenhaver-1992'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'associated-with', target: 'corpus-hermeticum' },
    ],
    tags: ['anthology', 'fragments'],
  },
  {
    id: 'technical-hermetica',
    type: 'work',
    name: 'The Technical Hermetica',
    epithet: 'Stars, stones, and remedies under Hermes’ name',
    dates: 'c. 2nd c. BCE onward',
    year: -100,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The practical wing of the Hermetic literature: astrological handbooks, treatises on the powers of plants and stones, and medical-astrological manuals ascribed to Hermes.',
    claims: [
      {
        text: 'Astrological and iatromathematical works under Hermes’ name predate the philosophical treatises, some reaching back to the second century BCE.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
      {
        text: 'Fowden argued the technical and philosophical Hermetica belong to one milieu — practical arts and the way of gnosis were not opposed.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['astrology', 'botany', 'medicine'],
  },
  {
    id: 'nag-hammadi-library',
    type: 'event',
    name: 'The Nag Hammadi Discovery',
    epithet: 'A jar in the desert reopens forgotten scriptures',
    dates: '1945',
    year: 1945,
    era: 'twentieth',
    cluster: 'hermetica',
    summary:
      'The 1945 find of thirteen Coptic codices near Nag Hammadi in Upper Egypt — Gnostic scriptures and, among them, previously unknown Hermetic texts.',
    claims: [
      {
        text: 'The Nag Hammadi codices, unearthed in 1945, contain Coptic Hermetica including the Discourse on the Eighth and Ninth, unknown before the find.',
        evidence: 'documented',
        sources: ['fowden-1986', 'hanegraaff-2005'],
      },
      {
        text: 'The find proved that Hermetic texts circulated among the same readers as Gnostic scripture in fourth-century Egypt.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'gnosis' },
      { kind: 'associated-with', target: 'discourse-eighth-ninth' },
    ],
    tags: ['1945', 'coptic', 'discovery'],
  },
  {
    id: 'discourse-eighth-ninth',
    type: 'work',
    name: 'The Discourse on the Eighth and Ninth',
    epithet: 'Initiation into the spheres beyond the seven',
    dates: 'c. 2nd–3rd c. CE (copied 4th c.)',
    year: 250,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'A Coptic Hermetic dialogue from Nag Hammadi in which a father-guide leads a disciple in prayer up into the eighth and ninth spheres — Hermetic ritual caught in the act.',
    claims: [
      {
        text: 'The text stages a living initiation — prayer, embrace, hymnody, and vision — evidence that the Hermetica served a practiced spiritual discipline, not just reading.',
        evidence: 'scholarship',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'associated-with', target: 'nag-hammadi-library' },
    ],
    tags: ['coptic', 'initiation', 'ogdoad'],
  },
  {
    id: 'greek-magical-papyri',
    type: 'work',
    name: 'The Greek Magical Papyri',
    epithet: 'The working spellbooks of Roman Egypt',
    dates: 'c. 2nd c. BCE – 5th c. CE',
    year: 300,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The surviving handbooks of Greco-Egyptian ritual power: invocations, lamp divinations, love charms, and the famous “Mithras Liturgy”, written for working magicians.',
    claims: [
      {
        text: 'The papyri preserve practical rites — invocation, divination, binding — in Greek, Demotic, and Coptic, from the same milieu that produced the Hermetica.',
        evidence: 'documented',
        sources: ['betz-1986'],
      },
      {
        text: 'Hermes and Thoth appear throughout the papyri as patrons of revelation and word-power.',
        evidence: 'scholarship',
        sources: ['betz-1986', 'fowden-1986'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermes-trismegistus' },
      { kind: 'influenced', target: 'natural-magic' },
    ],
    tags: ['spells', 'papyri', 'ritual'],
  },
  {
    id: 'neoplatonism',
    type: 'tradition',
    name: 'Neoplatonism',
    epithet: 'The One, and the long stair of being',
    dates: '3rd–6th c. CE',
    year: 250,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The late antique school of Plotinus and his heirs: all things emanate from the One, and the soul may climb back — a philosophy that became the backbone of Western esoteric thought.',
    claims: [
      {
        text: 'Plotinus’ Enneads set out reality as emanation from the One through Intellect and Soul, with the soul’s return as the goal of philosophy.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'Renaissance Platonists read the Hermetica through Neoplatonic eyes, fusing the two into a single “ancient theology”.',
        evidence: 'scholarship',
        sources: ['yates-1964'],
      },
    ],
    relations: [
      { kind: 'influenced', target: 'hermeticism' },
      { kind: 'influenced', target: 'prisca-theologia' },
    ],
    tags: ['emanation', 'the one', 'plotinus'],
  },
  {
    id: 'plotinus',
    type: 'person',
    name: 'Plotinus',
    epithet: 'The philosopher who unfolded the One',
    dates: 'c. 204–270 CE',
    year: 250,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The founder of Neoplatonism, whose Enneads describe all being as emanation from the ineffable One — and who dismissed ritual shortcuts to the divine.',
    claims: [
      {
        text: 'Plotinus taught in Rome; his student Porphyry edited his treatises into the six Enneads.',
        evidence: 'documented',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'neoplatonism' },
      { kind: 'influenced', target: 'porphyry' },
    ],
    tags: ['enneads', 'rome'],
  },
  {
    id: 'porphyry',
    type: 'person',
    name: 'Porphyry of Tyre',
    epithet: 'Editor of the Enneads, doubter of rites',
    dates: 'c. 234–305 CE',
    year: 280,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Plotinus’ editor and biographer, whose sceptical Letter to Anebo questioned ritual theurgy and provoked Iamblichus’ great defence.',
    claims: [
      {
        text: 'Porphyry’s Letter to Anebo challenged the efficacy of sacrificial and theurgic rites; Iamblichus’ De Mysteriis answers it point by point.',
        evidence: 'documented',
        sources: ['clarke-2003'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'neoplatonism' },
      { kind: 'critiqued', target: 'theurgy' },
    ],
    tags: ['enneads', 'letter to anebo'],
  },
  {
    id: 'iamblichus',
    type: 'person',
    name: 'Iamblichus',
    epithet: 'The defender of the rites of ascent',
    dates: 'c. 245–325 CE',
    year: 300,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Syrian Neoplatonist who answered philosophy’s doubts about ritual: the gods are reached not by thought alone but through sacred acts — theurgy.',
    claims: [
      {
        text: 'Writing as “Abamon the teacher”, Iamblichus defended theurgic ritual against Porphyry, grounding it in the sympathy binding cosmos and gods.',
        evidence: 'documented',
        sources: ['clarke-2003'],
      },
      {
        text: 'De Mysteriis opens by invoking Hermes, “the god who presides over words” — placing the defence under Hermetic patronage.',
        evidence: 'primary',
        sources: ['clarke-2003'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'neoplatonism' },
      { kind: 'wrote', target: 'de-mysteriis' },
    ],
    tags: ['syria', 'ritual', 'abamon'],
  },
  {
    id: 'de-mysteriis',
    type: 'work',
    name: 'De Mysteriis',
    epithet: 'The charter of theurgy',
    dates: 'c. 300 CE',
    year: 300,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Iamblichus’ reply to Porphyry: a systematic defence of divination, sacrifice, and ritual ascent, later beloved by Ficino’s Florence.',
    claims: [
      {
        text: 'The treatise argues that theurgic ritual works not by human thought but by divine symbols and powers the gods themselves have sown in matter.',
        evidence: 'primary',
        sources: ['clarke-2003'],
      },
      {
        text: 'Ficino translated and drew on De Mysteriis, carrying late antique theurgy into the Renaissance.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015', 'walker-1958'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'iamblichus' },
      { kind: 'influenced', target: 'marsilio-ficino' },
    ],
    tags: ['theurgy', 'divination', 'defence'],
  },
  {
    id: 'theurgy',
    type: 'concept',
    name: 'Theurgy',
    epithet: 'God-work: ritual as the ladder of return',
    dates: 'coined 2nd c. CE',
    year: 200,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The late antique art of “divine working” — rites, tokens, and invocations by which the soul cooperates with the gods in its own ascent, distinct from mere wonder-working.',
    claims: [
      {
        text: 'The term theourgia enters the record with the Chaldean Oracles milieu and is theorized by Iamblichus and Proclus as ritual cooperation with divine power.',
        evidence: 'scholarship',
        sources: ['clarke-2003', 'copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'chaldean-oracles' },
      { kind: 'associated-with', target: 'neoplatonism' },
      { kind: 'influenced', target: 'natural-magic' },
    ],
    tags: ['ritual', 'ascent', 'god-work'],
  },
  {
    id: 'chaldean-oracles',
    type: 'work',
    name: 'The Chaldean Oracles',
    epithet: 'Verses the gods were said to have spoken',
    dates: 'late 2nd c. CE',
    year: 180,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Fragmentary hexameter revelations associated with the two Julians, “the Chaldeans” — scripture for late Neoplatonists, who ranked them beside Plato.',
    claims: [
      {
        text: 'The Oracles survive only in fragments quoted by Neoplatonists; tradition ascribes them to Julian the Chaldean and his son Julian the Theurgist.',
        evidence: 'tradition',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'Proclus and the Athenian school treated the Oracles as revealed theology and wove them into Platonic metaphysics.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'theurgy' },
      { kind: 'influenced', target: 'proclus' },
    ],
    tags: ['oracles', 'fragments', 'fire'],
  },
  {
    id: 'proclus',
    type: 'person',
    name: 'Proclus',
    epithet: 'The last great systematizer of pagan Athens',
    dates: '412–485 CE',
    year: 450,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Head of the Athenian Academy, who built Neoplatonism into a vast architecture of triads and wrote the little treatise on sacrifice and magic beloved by Renaissance magi.',
    claims: [
      {
        text: 'Proclus’ On the Hieratic Art explains sympathetic chains linking stones, plants, and stars to the gods — a charter text for natural magic.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'neoplatonism' },
      { kind: 'influenced', target: 'correspondences' },
    ],
    tags: ['athens', 'triads', 'hieratic art'],
  },
  {
    id: 'hypatia',
    type: 'person',
    name: 'Hypatia of Alexandria',
    epithet: 'The philosopher the mob destroyed',
    dates: 'c. 355–415 CE',
    year: 400,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Mathematician and Neoplatonist teacher of Alexandria, murdered by a Christian mob in 415 — an emblem of the closing of the pagan schools.',
    claims: [
      {
        text: 'Hypatia taught mathematics and Platonic philosophy in Alexandria and was killed by a mob in 415 CE; her student Synesius became a Christian bishop.',
        evidence: 'documented',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'alexandria' },
      { kind: 'associated-with', target: 'neoplatonism' },
    ],
    tags: ['alexandria', 'mathematics', '415'],
  },
  {
    id: 'synesius',
    type: 'person',
    name: 'Synesius of Cyrene',
    epithet: 'Hypatia’s student, dreamer and bishop',
    dates: 'c. 373–414 CE',
    year: 405,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Neoplatonist pupil of Hypatia who became bishop of Ptolemais; his treatise On Dreams defended divination by the imagination, and alchemical tradition claims him too.',
    claims: [
      {
        text: 'Synesius’ De insomniis treats dreams as a natural, lawful divination through the soul’s imaginative faculty.',
        evidence: 'documented',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'A dialogue on the sacred art under Synesius’ name circulates among the Greek alchemical corpus — the attribution is traditional.',
        evidence: 'tradition',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'hypatia' },
      { kind: 'associated-with', target: 'alchemy' },
    ],
    tags: ['dreams', 'bishop', 'cyrene'],
  },
  {
    id: 'valentinus',
    type: 'person',
    name: 'Valentinus',
    epithet: 'The most eloquent of the Gnostic teachers',
    dates: 'fl. c. 140 CE',
    year: 140,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Alexandrian-trained Christian teacher whose school mapped the fall and redemption of Sophia through a pleroma of aeons — the grandest of the Gnostic systems.',
    claims: [
      {
        text: 'Valentinus taught at Rome in the mid-second century; the system bearing his name describes thirty aeons and the fall of Sophia, known through the Church Fathers and Nag Hammadi texts.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'gnosis' },
      { kind: 'associated-with', target: 'alexandria' },
    ],
    tags: ['gnosticism', 'aeons', 'sophia'],
  },
  {
    id: 'basilides',
    type: 'person',
    name: 'Basilides',
    epithet: 'Teacher of the unborn god beyond being',
    dates: 'fl. c. 120–140 CE',
    year: 130,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Alexandrian Gnostic teacher whose system began from a god beyond all predicates; later tradition attached to his school the amulet-name Abraxas.',
    claims: [
      {
        text: 'Basilides taught in Alexandria under Hadrian; his system is reported polemically by Irenaeus and Hippolytus, whose accounts disagree.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
      {
        text: 'The association of Abraxas with the Basilidean school comes from the heresiologists; the name is common on Greco-Egyptian gems regardless of school.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'gnosis' },
      { kind: 'associated-with', target: 'abraxas' },
    ],
    tags: ['gnosticism', 'alexandria'],
  },
  {
    id: 'abraxas',
    type: 'symbol',
    name: 'Abraxas',
    epithet: 'The cock-headed name of 365',
    dates: 'gems from 2nd c. CE',
    year: 150,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The word of power carved on Greco-Egyptian gems — often a cock-headed, serpent-legged figure — whose Greek letters sum to 365, the number of the days and the heavens.',
    claims: [
      {
        text: 'Abraxas appears on hundreds of engraved gems and in the magical papyri; by isopsephy its letters total 365.',
        evidence: 'documented',
        sources: ['betz-1986', 'hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'gnosis' },
      { kind: 'associated-with', target: 'greek-magical-papyri' },
    ],
    tags: ['gem', '365', 'amulet'],
  },
  {
    id: 'demiurge',
    type: 'concept',
    name: 'The Demiurge',
    epithet: 'The craftsman of the world — or its jailer',
    dates: 'Plato to the Gnostics',
    year: 150,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'Plato’s benevolent world-craftsman, reimagined by Gnostic writers as an ignorant or hostile maker from whom the spark of spirit must be freed.',
    claims: [
      {
        text: 'In Plato’s Timaeus the demiurge shapes the cosmos on eternal patterns; several Nag Hammadi texts recast the maker as blind Ialdabaoth.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'gnosis' },
      { kind: 'associated-with', target: 'neoplatonism' },
    ],
    tags: ['timaeus', 'ialdabaoth', 'maker'],
  },
  {
    id: 'caduceus',
    type: 'symbol',
    name: 'The Caduceus',
    epithet: 'Two serpents twined about the herald’s wand',
    dates: 'classical antiquity',
    year: -500,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The staff of Hermes: two serpents entwined beneath wings, badge of the god of exchange and revelation, and a favorite emblem of later Hermetic and alchemical printers.',
    claims: [
      {
        text: 'The kerykeion or caduceus is Hermes’ attribute as divine herald in Greek art from the archaic period onward.',
        evidence: 'documented',
        sources: ['hanegraaff-2005'],
      },
      {
        text: 'Alchemical emblem books adopted the caduceus for Mercurius, the mediating spirit of the work.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'hermes-trismegistus' },
      { kind: 'associated-with', target: 'alchemy' },
    ],
    tags: ['serpents', 'staff', 'mercurius'],
  },
  {
    id: 'as-above-so-below',
    type: 'concept',
    name: 'As Above, So Below',
    epithet: 'The axiom of the Emerald Tablet',
    dates: 'formula from late antiquity',
    year: 800,
    era: 'medieval',
    cluster: 'hermetica',
    summary:
      'The famous Hermetic maxim — “that which is above is like that which is below” — read for a millennium as the key to the mirror-play between heaven and earth.',
    claims: [
      {
        text: 'The formula opens the Emerald Tablet: what is below answers what is above, “to accomplish the miracles of the one thing”.',
        evidence: 'primary',
        sources: ['principe-2013'],
      },
      {
        text: 'Early modern and modern occultists made the maxim the shorthand for the whole doctrine of correspondences.',
        evidence: 'scholarship',
        sources: ['faivre-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'emerald-tablet' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['maxim', 'mirror', 'tablet'],
  },
  {
    id: 'macrocosm-microcosm',
    type: 'concept',
    name: 'Macrocosm and Microcosm',
    epithet: 'The world writ large, and written again in man',
    dates: 'antiquity onward',
    year: 200,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The doctrine that the human being is a little world mirroring the great one — the load-bearing wall of Hermetic, alchemical, and Paracelsian thought.',
    claims: [
      {
        text: 'The analogy of man as microcosm runs from Greek philosophy through the Hermetica into medieval and Renaissance cosmology.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'Paracelsian medicine reasoned from the correspondence of the body’s inner heaven to the outer stars.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'associated-with', target: 'paracelsus' },
    ],
    tags: ['analogy', 'cosmology', 'man'],
  },
  {
    id: 'anima-mundi',
    type: 'concept',
    name: 'Anima Mundi',
    epithet: 'The soul that quickens the whole world',
    dates: 'Plato’s Timaeus onward',
    year: -360,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The world-soul of the Timaeus: one life animating the cosmos, through which Renaissance magi explained how spirit flows between stars, stones, and souls.',
    claims: [
      {
        text: 'Plato’s Timaeus describes a world-soul diffused through the cosmos; Neoplatonists made it the channel of cosmic sympathy.',
        evidence: 'scholarship',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'Ficino’s natural magic works through spiritus mundi, the subtle vehicle of the world-soul.',
        evidence: 'scholarship',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'neoplatonism' },
      { kind: 'influenced', target: 'natural-magic' },
    ],
    tags: ['world-soul', 'sympathy', 'timaeus'],
  },
  {
    id: 'heimarmene',
    type: 'concept',
    name: 'Heimarmenē',
    epithet: 'Fate written in the wheeling spheres',
    dates: 'Hellenistic period',
    year: 100,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The astral fate that binds embodied souls in Hermetic and Gnostic cosmology — the tyranny of the seven spheres that gnosis promises to overcome.',
    claims: [
      {
        text: 'In the Poimandres, the soul descending through the spheres takes on the powers of each planet and ascends by returning them — release from heimarmenē.',
        evidence: 'primary',
        sources: ['copenhaver-1992'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'gnosis' },
      { kind: 'associated-with', target: 'poimandres' },
    ],
    tags: ['fate', 'astrology', 'spheres'],
  },
  {
    id: 'hermetic-rebirth',
    type: 'concept',
    name: 'Hermetic Rebirth',
    epithet: 'To be born again in mind',
    dates: 'c. 2nd–3rd c. CE',
    year: 200,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The palingenesia of Corpus Hermeticum XIII: a secret dialogue on being reborn out of the body’s powers into a body of powers divine.',
    claims: [
      {
        text: 'CH XIII stages Tat’s rebirth: twelve tormentors are driven out by ten divine powers, and the initiate sings the secret hymn of the ogdoad.',
        evidence: 'primary',
        sources: ['copenhaver-1992'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'corpus-hermeticum' },
      { kind: 'associated-with', target: 'gnosis' },
    ],
    tags: ['palingenesia', 'hymn', 'initiation'],
  },
  {
    id: 'lactantius',
    type: 'person',
    name: 'Lactantius',
    epithet: 'The Church Father who claimed Hermes for Christ',
    dates: 'c. 250–325 CE',
    year: 310,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Christian rhetorician who quoted Hermes Trismegistus as a pagan prophet of the Son of God — the friendly reading that later licensed Christian Hermetism.',
    claims: [
      {
        text: 'In the Divine Institutes Lactantius cites Hermes among the oldest witnesses to the one God and his Word.',
        evidence: 'documented',
        sources: ['ebeling-2007'],
      },
      {
        text: 'Lactantius’ favorable verdict, against Augustine’s hostile one, framed the medieval and Renaissance debate over Hermes.',
        evidence: 'scholarship',
        sources: ['ebeling-2007', 'yates-1964'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermes-trismegistus' },
      { kind: 'influenced', target: 'prisca-theologia' },
    ],
    tags: ['church father', 'prophecy'],
  },
  {
    id: 'augustine-of-hippo',
    type: 'person',
    name: 'Augustine of Hippo',
    epithet: 'The bishop who condemned the god-makers',
    dates: '354–430 CE',
    year: 420,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The great Latin Father whose City of God attacked the Asclepius’ animated statues as demon-worship — the standing objection every Christian Hermetist had to answer.',
    claims: [
      {
        text: 'In City of God VIII Augustine condemns the god-making passage of the Asclepius as idolatrous commerce with demons.',
        evidence: 'documented',
        sources: ['ebeling-2007'],
      },
    ],
    relations: [
      { kind: 'critiqued', target: 'asclepius-dialogue' },
      { kind: 'associated-with', target: 'hermes-trismegistus' },
    ],
    tags: ['city of god', 'polemic'],
  },
  {
    id: 'apuleius',
    type: 'person',
    name: 'Apuleius of Madauros',
    epithet: 'Novelist, Platonist, alleged magician',
    dates: 'c. 124–170 CE',
    year: 160,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The author of The Golden Ass, tried for magic and acquitted, to whom the Latin translation of the Asclepius was traditionally ascribed.',
    claims: [
      {
        text: 'Apuleius defended himself against a charge of magic in his surviving Apologia; his novel ends in the mysteries of Isis.',
        evidence: 'documented',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'Medieval manuscripts transmit the Latin Asclepius among Apuleius’ works; the attribution is no longer accepted.',
        evidence: 'tradition',
        sources: ['copenhaver-1992'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'asclepius-dialogue' },
      { kind: 'associated-with', target: 'natural-magic' },
    ],
    tags: ['golden ass', 'apologia', 'isis'],
  },
  {
    id: 'sabians-of-harran',
    type: 'organization',
    name: 'The Sabians of Harran',
    epithet: 'The star-worshippers who kept Hermes alive in Islam',
    dates: 'fl. 8th–11th c.',
    year: 850,
    era: 'medieval',
    cluster: 'hermetica',
    summary:
      'The pagan community of Harran who, under Islam, claimed Hermes as their prophet and the Hermetica as their scripture — a bridge carrying Hermetic learning into Arabic.',
    claims: [
      {
        text: 'Arabic sources report that the Harranians identified their prophet as Hermes and were tolerated as “Sabians”, a people of the book.',
        evidence: 'primary',
        sources: ['ebeling-2007'],
      },
      {
        text: 'Hermes entered Arabic letters as a triple figure — antediluvian sage, Babylonian, and Egyptian — through such channels.',
        evidence: 'scholarship',
        sources: ['ebeling-2007'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermes-trismegistus' },
      { kind: 'influenced', target: 'picatrix' },
    ],
    tags: ['harran', 'arabic', 'star cult'],
  },
  {
    id: 'apollonius-of-tyana',
    type: 'person',
    name: 'Apollonius of Tyana',
    epithet: 'The wandering sage under whose name the Tablet surfaced',
    dates: 'c. 15–100 CE',
    year: 80,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The Pythagorean holy man of the first century, remembered in Arabic as Balīnūs, under whose name the Book of the Secret of Creation — first witness of the Emerald Tablet — circulated.',
    claims: [
      {
        text: 'Philostratus’ Life presents Apollonius as an itinerant Pythagorean sage and wonder-worker.',
        evidence: 'documented',
        sources: ['copenhaver-2015'],
      },
      {
        text: 'The Arabic Sirr al-khalīqa, ascribed to Balīnūs, embeds the earliest known text of the Emerald Tablet.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'ebeling-2007'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'kitab-sirr-al-khaliqa' },
      { kind: 'associated-with', target: 'emerald-tablet' },
    ],
    tags: ['balinus', 'pythagorean'],
  },
  {
    id: 'kitab-sirr-al-khaliqa',
    type: 'work',
    name: 'Kitāb Sirr al-Khalīqa',
    epithet: 'The Book of the Secret of Creation',
    dates: 'c. 8th–9th c.',
    year: 800,
    era: 'medieval',
    cluster: 'hermetica',
    summary:
      'The Arabic cosmological treatise ascribed to Balīnūs (Apollonius), which closes with the earliest surviving text of the Emerald Tablet, found in a vault beneath a statue of Hermes.',
    claims: [
      {
        text: 'The Sirr al-khalīqa contains the oldest known version of the Emerald Tablet, framed by the story of its discovery in a crypt.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'ebeling-2007'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'apollonius-of-tyana' },
      { kind: 'associated-with', target: 'emerald-tablet' },
    ],
    tags: ['arabic', 'crypt', 'creation'],
  },
  {
    id: 'lodovico-lazzarelli',
    type: 'person',
    name: 'Lodovico Lazzarelli',
    epithet: 'The poet reborn through Hermes',
    dates: '1447–1500',
    year: 1490,
    era: 'renaissance',
    cluster: 'hermetica',
    summary:
      'The Italian humanist who took Hermetism as a lived religion: translating the treatises Ficino left aside and writing the Crater Hermetis on spiritual rebirth.',
    claims: [
      {
        text: 'Lazzarelli translated Corpus Hermeticum XVI–XVIII, completing Ficino’s version, and dedicated his Crater Hermetis to King Ferdinand of Aragon.',
        evidence: 'documented',
        sources: ['hanegraaff-2005'],
      },
      {
        text: 'He hailed the wandering preacher Giovanni da Correggio as a living Hermetic master — Hermetism practiced, not merely studied.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'crater-hermetis' },
      { kind: 'associated-with', target: 'ficino-translation' },
    ],
    tags: ['humanist', 'rebirth', 'correggio'],
  },
  {
    id: 'crater-hermetis',
    type: 'work',
    name: 'Crater Hermetis',
    epithet: 'The mixing-bowl of mind, offered again',
    dates: 'c. 1494',
    year: 1494,
    era: 'renaissance',
    cluster: 'hermetica',
    summary:
      'Lazzarelli’s dialogue on Hermetic rebirth, named for the bowl of mind God set among souls in Corpus Hermeticum IV — Renaissance Hermetism at its most devout.',
    claims: [
      {
        text: 'The Crater Hermetis presents Christian-Hermetic regeneration as a real spiritual attainment, culminating in the generation of divine souls.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'lodovico-lazzarelli' },
      { kind: 'derived-from', target: 'corpus-hermeticum' },
    ],
    tags: ['dialogue', 'rebirth', 'crater'],
  },
  {
    id: 'hermetic-definitions',
    type: 'work',
    name: 'The Definitions of Hermes to Asclepius',
    epithet: 'Aphorisms of the teacher, kept in Armenian',
    dates: 'c. 1st c. CE (Armenian trans. 6th c.)',
    year: 100,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'A collection of terse Hermetic aphorisms preserved in Armenian translation — possibly among the oldest strata of the Hermetic teaching.',
    claims: [
      {
        text: 'The Armenian Definitions transmit compact Hermetic sentences on God, cosmos, and man; scholars have argued they reflect an early stage of the tradition.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'hermeticism' },
      { kind: 'attributed-to', target: 'hermes-trismegistus' },
    ],
    tags: ['aphorisms', 'armenian'],
  },
  {
    id: 'julian-the-theurgist',
    type: 'person',
    name: 'Julian the Theurgist',
    epithet: 'The reputed channel of the Oracles',
    dates: 'fl. c. 170 CE',
    year: 170,
    era: 'antiquity',
    cluster: 'hermetica',
    summary:
      'The shadowy figure credited with receiving the Chaldean Oracles under Marcus Aurelius — and, in legend, with working the rain-miracle that saved a Roman legion.',
    claims: [
      {
        text: 'Byzantine sources credit Julian and his father with the Chaldean Oracles; the rain-miracle story is late and legendary.',
        evidence: 'legend',
        sources: ['copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'chaldean-oracles' },
      { kind: 'associated-with', target: 'theurgy' },
    ],
    tags: ['oracles', 'rain-miracle'],
  },
];
