import type { Entity } from '../../domain/types';

export const earlyModern: Entity[] = [
  {
    id: 'rosicrucianism',
    type: 'tradition',
    name: 'Rosicrucianism',
    epithet: 'The invisible brotherhood that existed first on paper',
    dates: 'manifestos 1614–1616',
    year: 1614,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The movement ignited by two anonymous manifestos and an allegorical romance announcing a hidden brotherhood of learned reformers — a literary event with a very real afterlife.',
    claims: [
      {
        text: 'Two manifestos (1614, 1615) and an allegorical romance (1616) announced an invisible brotherhood of learned reformers, setting off a pamphlet storm across Protestant Europe.',
        evidence: 'documented',
        sources: ['fama-1614', 'yates-1972', 'mcintosh-1997'],
      },
      {
        text: 'No contemporary evidence shows the brotherhood existed as described; scholarship reads the manifestos as a project of the Tübingen circle around Johann Valentin Andreae.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997', 'yates-1972'],
      },
      {
        text: 'Later initiatic orders from the eighteenth century onward claimed Rosicrucian descent — claims of continuity that are traditional rather than documented.',
        evidence: 'tradition',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'rose-cross' },
      { kind: 'influenced', target: 'freemasonry', note: 'eighteenth-century Rose Croix degrees' },
      { kind: 'influenced', target: 'golden-dawn' },
    ],
    tags: ['manifestos', 'brotherhood', 'reform', 'invisible college'],
  },
  {
    id: 'fama-fraternitatis',
    type: 'work',
    name: 'Fama Fraternitatis',
    epithet: 'The rumour of the brotherhood, printed at Kassel',
    dates: '1614',
    year: 1614,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The first Rosicrucian manifesto: the story of Brother C.R., his journey east in search of learning, and the marvellous tomb discovered after 120 years.',
    claims: [
      {
        text: 'Printed at Kassel in 1614 after circulating in manuscript, the Fama tells of Brother C.R., his journey east, and the discovery of his tomb after 120 years.',
        evidence: 'documented',
        sources: ['fama-1614', 'mcintosh-1997'],
      },
      {
        text: 'The Fama presents its story of the founder and his vault as history; no external record corroborates it.',
        evidence: 'primary',
        sources: ['fama-1614'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'rosicrucianism' },
      { kind: 'associated-with', target: 'christian-rosenkreutz' },
    ],
    tags: ['manifesto', 'kassel', 'vault', '1614'],
  },
  {
    id: 'chymical-wedding',
    type: 'work',
    name: 'The Chymical Wedding of Christian Rosenkreutz',
    epithet: 'A seven-day alchemical romance',
    dates: '1616',
    year: 1616,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The allegorical romance printed at Strasbourg in 1616, narrating Christian Rosenkreutz’s dream-journey to a royal wedding — later acknowledged by Andreae as his own youthful “ludibrium”.',
    claims: [
      {
        text: 'An alchemical allegory printed at Strasbourg in 1616, narrating Christian Rosenkreutz’s seven-day journey to a royal wedding.',
        evidence: 'documented',
        sources: ['chymical-1616', 'mcintosh-1997'],
      },
      {
        text: 'Andreae later called the book a ludibrium — a jest or play — in his autobiography, while acknowledging that he wrote it.',
        evidence: 'documented',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'rosicrucianism' },
      { kind: 'associated-with', target: 'christian-rosenkreutz' },
    ],
    tags: ['allegory', 'strasbourg', 'wedding', 'ludibrium'],
  },
  {
    id: 'christian-rosenkreutz',
    type: 'person',
    name: 'Christian Rosenkreutz',
    epithet: 'The founder who lived only in the story',
    dates: 'said to have lived 1378–1484',
    year: 1400,
    era: 'renaissance',
    cluster: 'early-modern',
    summary:
      'The legendary founder of the Rosicrucian brotherhood, whose 106-year life and wondrous tomb are told in the manifestos — an allegorical figure, not a documented person.',
    claims: [
      {
        text: 'The manifestos date his birth to 1378 and his life to 106 years, and describe his uncorrupted body found in a seven-sided vault lit by an inner sun.',
        evidence: 'legend',
        sources: ['fama-1614'],
      },
      {
        text: 'Historians treat him as an allegorical founder-figure rather than a historical person.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997', 'yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'fama-fraternitatis' },
      { kind: 'associated-with', target: 'rosicrucianism' },
    ],
    tags: ['legend', 'vault', 'founder'],
  },
  {
    id: 'johann-valentin-andreae',
    type: 'person',
    name: 'Johann Valentin Andreae',
    epithet: 'The theologian behind the jest that became a movement',
    dates: '1586–1654',
    year: 1616,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Lutheran theologian of Tübingen, acknowledged author of the Chymical Wedding, whose circle scholarship credits with the Rosicrucian manifestos — and who watched, half-appalled, as the jest caught fire.',
    claims: [
      {
        text: 'A Lutheran theologian of Tübingen; his autobiography claims the Chymical Wedding among his youthful works.',
        evidence: 'documented',
        sources: ['mcintosh-1997'],
      },
      {
        text: 'Scholars debate how far he and his circle authored the manifestos themselves; his later writings mock the “Rosicrucian” furore he helped ignite.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997', 'yates-1972'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'chymical-wedding' },
      { kind: 'associated-with', target: 'rosicrucianism' },
    ],
    tags: ['tübingen', 'lutheran', 'ludibrium'],
  },
  {
    id: 'rose-cross',
    type: 'symbol',
    name: 'The Rose Cross',
    epithet: 'A rose blooming at the heart of a cross',
    dates: 'from 1614',
    year: 1614,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The emblem of the Rosicrucian furore — never explained by the manifestos themselves, and elaborated into ever-richer forms by later orders.',
    claims: [
      {
        text: 'The rose and cross emblem invited many readings — Luther’s seal joins rose and cross, and alchemical and heraldic sources offer parallels; the manifestos never explain it.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997', 'yates-1972'],
      },
      {
        text: 'The Golden Dawn’s elaborate Rose Cross lamen is a nineteenth-century construction upon the older emblem.',
        evidence: 'tradition',
        sources: ['regardie-1940'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'rosicrucianism' },
      { kind: 'associated-with', target: 'golden-dawn' },
    ],
    tags: ['rose', 'cross', 'emblem'],
  },
  {
    id: 'jacob-boehme',
    type: 'person',
    name: 'Jacob Böhme',
    epithet: 'The shoemaker of Görlitz who saw the dawn',
    dates: '1575–1624',
    year: 1612,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Lusatian shoemaker whose Aurora began a body of visionary theosophy — God revealed through contraries — that would nourish currents from Pietism to Romantic philosophy.',
    claims: [
      {
        text: 'A shoemaker of Görlitz whose Aurora (1612) began an oeuvre describing God’s self-revelation through contraries; the local clergy silenced him for years.',
        evidence: 'documented',
        sources: ['boehme-1612', 'weeks-1991'],
      },
      {
        text: 'Böhme’s theosophy, nourished on Paracelsian vocabulary, fed later currents from radical Pietism to Romantic philosophy.',
        evidence: 'scholarship',
        sources: ['weeks-1991', 'faivre-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'rosicrucianism', note: 'read in the same early seventeenth-century reforming milieu' },
    ],
    tags: ['görlitz', 'theosophy', 'aurora', 'visionary'],
  },
  {
    id: 'confessio-fraternitatis',
    type: 'work',
    name: 'Confessio Fraternitatis',
    epithet: 'The brotherhood confesses its program',
    dates: '1615',
    year: 1615,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The second Rosicrucian manifesto: sharper than the Fama, promising the reform of knowledge before the end, and denouncing the pope in print.',
    claims: [
      {
        text: 'The Confessio, printed at Kassel in 1615 with an accompanying Latin tract, restates the fraternity’s offer in more militant, apocalyptic terms.',
        evidence: 'documented',
        sources: ['confessio-1615', 'yates-1972'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'rosicrucianism' },
      { kind: 'associated-with', target: 'fama-fraternitatis' },
    ],
    tags: ['manifesto', '1615', 'kassel'],
  },
  {
    id: 'tubingen-circle',
    type: 'organization',
    name: 'The Tübingen Circle',
    epithet: 'The friends who wrote a brotherhood into being',
    dates: 'c. 1608–1620',
    year: 1610,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The learned circle around Andreae, Tobias Hess, and Christoph Besold at Tübingen — utopian Lutherans whose manuscripts became the Rosicrucian manifestos.',
    claims: [
      {
        text: 'Scholarship locates the origin of the manifestos in the Tübingen milieu of Andreae, Hess, and Besold, where the Fama circulated in manuscript before printing.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997', 'yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'johann-valentin-andreae' },
      { kind: 'founded', target: 'rosicrucianism', note: 'as a literary program' },
    ],
    tags: ['tübingen', 'utopian', 'lutherans'],
  },
  {
    id: 'tobias-hess',
    type: 'person',
    name: 'Tobias Hess',
    epithet: 'The physician at the heart of the invisible order',
    dates: '1568–1614',
    year: 1610,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Tübingen jurist-physician, Paracelsian and chiliast, Andreae’s beloved elder friend — widely credited as co-begetter of the Rosicrucian scheme, dead the year the Fama was printed.',
    claims: [
      {
        text: 'Andreae’s own writings honor Hess as intimate collaborator; scholars assign him a central role in the genesis of the manifestos.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'tubingen-circle' },
      { kind: 'collaborated-with', target: 'johann-valentin-andreae' },
    ],
    tags: ['paracelsian', 'chiliasm', 'tübingen'],
  },
  {
    id: 'christoph-besold',
    type: 'person',
    name: 'Christoph Besold',
    epithet: 'The jurist with ten thousand books',
    dates: '1577–1638',
    year: 1615,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Tübingen’s polymath professor of law, master of many languages and owner of a famous library, whose learning fed the manifestos — and who ended a Catholic convert.',
    claims: [
      {
        text: 'Besold belonged to Andreae’s inner circle and supplied esoteric learning to it; his library survives at Salzburg.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'tubingen-circle' },
      { kind: 'associated-with', target: 'johann-valentin-andreae' },
    ],
    tags: ['law', 'library', 'tübingen'],
  },
  {
    id: 'adam-haslmayr',
    type: 'person',
    name: 'Adam Haslmayr',
    epithet: 'The first to answer — and the first to pay',
    dates: 'c. 1560–1630',
    year: 1612,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Tyrolean Paracelsian who published the first public reply to the Fama in 1612 — and was sent to the galleys for it by the Habsburgs.',
    claims: [
      {
        text: 'Haslmayr’s Answer to the Fama, printed 1612, preceded the manifesto’s own printing; his punishment as a heterodox Paracelsian included galley service.',
        evidence: 'documented',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'fama-fraternitatis' },
      { kind: 'part-of', target: 'rosicrucian-furore' },
    ],
    tags: ['tyrol', 'galleys', '1612'],
  },
  {
    id: 'rosicrucian-furore',
    type: 'event',
    name: 'The Rosicrucian Furore',
    epithet: 'Europe writes letters to an address that isn’t there',
    dates: 'c. 1614–1625',
    year: 1620,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The pamphlet storm that followed the manifestos: hundreds of printed replies, petitions, defences, and denunciations addressed to a brotherhood no one could find.',
    claims: [
      {
        text: 'Several hundred tracts responding to the manifestos appeared within a decade, from eager petitions to learned refutations.',
        evidence: 'scholarship',
        sources: ['yates-1972', 'mcintosh-1997'],
      },
      {
        text: 'Descartes was rumored on his return to Paris in 1623 to have joined the invisibles — he showed himself in public to refute it.',
        evidence: 'primary',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'fama-fraternitatis' },
      { kind: 'associated-with', target: 'rosicrucianism' },
    ],
    tags: ['pamphlets', 'invisibles', 'furore'],
  },
  {
    id: 'daniel-mogling',
    type: 'person',
    name: 'Daniel Mögling',
    epithet: 'Theophilus Schweighardt, painter of the invisible college',
    dates: '1596–1635',
    year: 1618,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The young Tübingen physician who, as Theophilus Schweighardt, published the Speculum Sophicum with its famous engraving of the wheeled, winged College of the Fraternity.',
    claims: [
      {
        text: 'Mögling’s Speculum Sophicum Rhodostauroticum (1618) includes the celebrated emblem of the mobile Collegium Fraternitatis on wheels and wings.',
        evidence: 'documented',
        sources: ['mcintosh-1997', 'yates-1972'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'speculum-sophicum' },
      { kind: 'part-of', target: 'rosicrucianism' },
    ],
    tags: ['pseudonym', 'emblem', '1618'],
  },
  {
    id: 'speculum-sophicum',
    type: 'work',
    name: 'Speculum Sophicum Rhodostauroticum',
    epithet: 'The mirror of Rosicrucian wisdom, on wheels',
    dates: '1618',
    year: 1618,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Schweighardt’s illustrated defence of the fraternity, whose engraved college — winged, wheeled, watchful — became the era’s image of invisible learning.',
    claims: [
      {
        text: 'The tract teaches that the true college is everywhere and nowhere, reached by prayer and work rather than address.',
        evidence: 'primary',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'daniel-mogling' },
      { kind: 'part-of', target: 'rosicrucianism' },
    ],
    tags: ['engraving', 'college'],
  },
  {
    id: 'johannes-bureus',
    type: 'person',
    name: 'Johannes Bureus',
    epithet: 'The runemaster of the northern rose-cross',
    dates: '1568–1652',
    year: 1620,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Sweden’s royal antiquarian and tutor to Gustavus Adolphus, who fused runic lore with cabala into an “adulruna” mysticism and answered the Rosicrucians in kind.',
    claims: [
      {
        text: 'Bureus pioneered runic scholarship and developed a cabalistic system of the runes; he issued Rosicrucian-style proclamations including the FaMa e sCanzIa of 1616.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'rosicrucianism' },
      { kind: 'associated-with', target: 'christian-cabala' },
    ],
    tags: ['runes', 'sweden', 'adulruna'],
  },
  {
    id: 'frederick-v',
    type: 'person',
    name: 'Frederick V of the Palatinate',
    epithet: 'The winter king of the alchemical wedding',
    dates: '1596–1632',
    year: 1619,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Elector Palatine whose marriage to Elizabeth Stuart and brief Bohemian crown Yates read as the political hope behind the Rosicrucian spring — extinguished at White Mountain.',
    claims: [
      {
        text: 'Frederick accepted the Bohemian crown in 1619 and lost it within a winter; Yates connected the Palatine court culture at Heidelberg with the Rosicrucian movement.',
        evidence: 'scholarship',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'heidelberg' },
      { kind: 'associated-with', target: 'white-mountain' },
    ],
    tags: ['winter king', 'bohemia', 'palatinate'],
  },
  {
    id: 'heidelberg',
    type: 'place',
    name: 'Heidelberg',
    epithet: 'The castle of gardens, grottoes, and hopes',
    dates: 'Palatine court to 1620',
    year: 1615,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Seat of the Elector Palatine: its wondrous gardens and mechanical grottoes by Salomon de Caus made it, in Yates’ telling, the theatre of the Rosicrucian moment.',
    claims: [
      {
        text: 'The Hortus Palatinus and court culture of Heidelberg embodied the era’s alliance of art, mechanics, and reforming hope.',
        evidence: 'scholarship',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'frederick-v' },
      { kind: 'associated-with', target: 'rosicrucianism' },
    ],
    tags: ['palatinate', 'gardens'],
  },
  {
    id: 'white-mountain',
    type: 'event',
    name: 'The Battle of White Mountain',
    epithet: 'The hour the Rosicrucian spring ended',
    dates: '8 November 1620',
    year: 1620,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Catholic victory outside Prague that destroyed Frederick’s Bohemian kingship in a morning — and with it, the political horizon of the Rosicrucian enthusiasm.',
    claims: [
      {
        text: 'Imperial-Catholic forces routed the Bohemian army on 8 November 1620; Frederick and Elizabeth fled, and the Palatinate was overrun.',
        evidence: 'documented',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'frederick-v' },
      { kind: 'associated-with', target: 'prague' },
    ],
    tags: ['1620', 'defeat', 'bohemia'],
  },
  {
    id: 'robert-fludd',
    type: 'person',
    name: 'Robert Fludd',
    epithet: 'The English cosmographer of both worlds',
    dates: '1574–1637',
    year: 1617,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The London physician who answered the manifestos with folios: his history of the macrocosm and microcosm, engraved by de Bry, is the grandest visual system of the Hermetic world-picture.',
    claims: [
      {
        text: 'Fludd published defences of the Rosicrucians (1616–17) and the vast Utriusque Cosmi Historia, and defended his philosophy against Kepler and Mersenne.',
        evidence: 'documented',
        sources: ['fludd-1617', 'yates-1972'],
      },
      {
        text: 'His monochord of the world and memory-theatre plates are standard emblems of the correspondence doctrine.',
        evidence: 'scholarship',
        sources: ['yates-1972', 'goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'utriusque-cosmi-historia' },
      { kind: 'associated-with', target: 'rosicrucianism', note: 'apologist, not member' },
    ],
    tags: ['london', 'monochord', 'de bry'],
  },
  {
    id: 'utriusque-cosmi-historia',
    type: 'work',
    name: 'Utriusque Cosmi Historia',
    epithet: 'The history of both worlds, engraved entire',
    dates: '1617–1621',
    year: 1617,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Fludd’s unfinished encyclopaedia of macrocosm and microcosm — creation, music, memory, palmistry, fortification — bound together by the world-monochord and the mirror of man.',
    claims: [
      {
        text: 'Published by de Bry at Oppenheim from 1617, the work’s engravings map the correspondences of world and man in unprecedented visual detail.',
        evidence: 'documented',
        sources: ['fludd-1617'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'robert-fludd' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['engravings', 'macrocosm', 'oppenheim'],
  },
  {
    id: 'michael-maier',
    type: 'person',
    name: 'Michael Maier',
    epithet: 'Imperial physician, emblematist of the fleeing Atalanta',
    dates: '1568–1622',
    year: 1617,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Rudolf II’s physician and the most learned literary defender of the Rosicrucians, whose Atalanta Fugiens set alchemy to emblems, epigrams, and fugues for three voices.',
    claims: [
      {
        text: 'Maier served Rudolf II, wrote defences of the fraternity such as Silentium post clamores, and published Atalanta Fugiens in 1617.',
        evidence: 'documented',
        sources: ['maier-1617', 'mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'atalanta-fugiens' },
      { kind: 'associated-with', target: 'rudolf-ii' },
      { kind: 'associated-with', target: 'rosicrucianism' },
    ],
    tags: ['emblems', 'imperial court'],
  },
  {
    id: 'atalanta-fugiens',
    type: 'work',
    name: 'Atalanta Fugiens',
    epithet: 'Alchemy scored for eye, ear, and intellect',
    dates: '1617',
    year: 1617,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Maier’s emblem book of fifty engravings, each with epigram, discourse, and a three-voice fugue — the multimedia masterpiece of alchemical publishing.',
    claims: [
      {
        text: 'Atalanta Fugiens pairs each of its fifty emblems with a canon for three voices, allegorized as Atalanta, Hippomenes, and the golden apple.',
        evidence: 'documented',
        sources: ['maier-1617'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'michael-maier' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['emblems', 'fugues', '1617'],
  },
  {
    id: 'comenius',
    type: 'person',
    name: 'Jan Amos Comenius',
    epithet: 'The exile who taught Europe to teach',
    dates: '1592–1670',
    year: 1640,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The last bishop of the Bohemian Brethren, father of universal education, whose pansophic program carried the reforming hopes of the Rosicrucian generation across a ruined Europe.',
    claims: [
      {
        text: 'Comenius’ Labyrinth of the World responds to the Rosicrucian episode, and his pansophia sought the reform of all knowledge through universal schooling.',
        evidence: 'scholarship',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'pansophia' },
      { kind: 'associated-with', target: 'samuel-hartlib' },
    ],
    tags: ['education', 'bohemian brethren', 'exile'],
  },
  {
    id: 'samuel-hartlib',
    type: 'person',
    name: 'Samuel Hartlib',
    epithet: 'The intelligencer of universal reformation',
    dates: 'c. 1600–1662',
    year: 1640,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Prussian émigré at the centre of England’s reforming correspondence network — clearing-house for pansophy, husbandry, and invention, and host to Comenius’ London visit.',
    claims: [
      {
        text: 'Hartlib’s circle promoted Comenian pansophia and schemes of universal knowledge; his surviving papers document the network in detail.',
        evidence: 'documented',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'collaborated-with', target: 'comenius' },
      { kind: 'associated-with', target: 'invisible-college' },
    ],
    tags: ['correspondence', 'reform', 'london'],
  },
  {
    id: 'invisible-college',
    type: 'concept',
    name: 'The Invisible College',
    epithet: 'A fellowship with no walls, before the Royal Society',
    dates: '1640s',
    year: 1646,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Boyle’s name in the 1640s for his circle of experimental philosophers — a phrase carrying the Rosicrucian dream of invisible fellowship into the prehistory of the Royal Society.',
    claims: [
      {
        text: 'Robert Boyle’s letters of 1646–47 speak of an “invisible college”; historians debate its exact membership and its Rosicrucian echo.',
        evidence: 'documented',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'robert-boyle' },
      { kind: 'derived-from', target: 'rosicrucianism', note: 'as an image of invisible fellowship' },
    ],
    tags: ['royal society', 'boyle', 'fellowship'],
  },
  {
    id: 'thomas-vaughan',
    type: 'person',
    name: 'Thomas Vaughan',
    epithet: 'Eugenius Philalethes, who Englished the Fama',
    dates: '1621–1666',
    year: 1652,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Welsh alchemist-priest, twin of the poet Henry Vaughan, who published the first English translation of the manifestos in 1652 and wrote fiery Hermetic tracts as Eugenius Philalethes.',
    claims: [
      {
        text: 'Vaughan’s 1652 volume printed the Fama and Confessio in English with his preface; his own tracts expound a Christian Hermetic natural philosophy.',
        evidence: 'documented',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'translated', target: 'fama-fraternitatis' },
      { kind: 'part-of', target: 'rosicrucianism', note: 'as transmitter' },
    ],
    tags: ['wales', 'translation', '1652'],
  },
  {
    id: 'john-heydon',
    type: 'person',
    name: 'John Heydon',
    epithet: 'The self-appointed servant of the Rosie Cross',
    dates: '1629–c. 1667',
    year: 1660,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The English astrologer-lawyer who spun the Rosicrucian legend into baroque romance — voyages to the invisible castle, rules of the brotherhood, wonders for sale.',
    claims: [
      {
        text: 'Heydon styled himself “a servant of God and secretary of nature” and published Rosicrucian romances such as The Holy Guide (1662), borrowing freely from Bacon and others.',
        evidence: 'documented',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'rosicrucianism', note: 'as popularizer' },
      { kind: 'associated-with', target: 'london' },
    ],
    tags: ['romance', 'astrologer'],
  },
  {
    id: 'gorlitz',
    type: 'place',
    name: 'Görlitz',
    epithet: 'The shoemaker’s town on the Neisse',
    dates: 'Boehme’s home, 1599–1624',
    year: 1612,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Lusatian trading town where Jacob Boehme kept his stall, saw eternity in a pewter dish, and was silenced by his own pastor.',
    claims: [
      {
        text: 'Boehme lived and wrote in Görlitz; after Aurora circulated, the town’s chief pastor Gregor Richter had him forbidden to write.',
        evidence: 'documented',
        sources: ['weeks-1991'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'jacob-boehme' },
      { kind: 'located-in', target: 'prague', note: 'in the same Habsburg-borderland world' },
    ],
    tags: ['lusatia', 'shoemaker'],
  },
  {
    id: 'aurora-boehme',
    type: 'work',
    name: 'Aurora (Morgenröte im Aufgang)',
    epithet: 'The dawn-red rising that a pastor tried to stop',
    dates: '1612 (manuscript)',
    year: 1612,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Boehme’s first book: the unfinished dawn in which the shoemaker poured his vision of God’s wrath and love wrestling at the root of nature.',
    claims: [
      {
        text: 'Aurora circulated in manuscript from 1612 and brought Boehme the ban on writing; he broke it seven years later.',
        evidence: 'documented',
        sources: ['boehme-1612', 'weeks-1991'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'jacob-boehme' },
      { kind: 'part-of', target: 'christian-theosophy' },
    ],
    tags: ['dawn', 'manuscript', '1612'],
  },
  {
    id: 'signatura-rerum',
    type: 'work',
    name: 'De Signatura Rerum',
    epithet: 'The signature of all things, read aloud',
    dates: '1622',
    year: 1622,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Boehme’s treatise on the signatures: every creature’s outward form sounds the inward quality that shaped it — nature as legible speech.',
    claims: [
      {
        text: 'De signatura rerum expounds the doctrine that inner essences mark themselves in outward forms, joining Paracelsian signatures to Boehme’s theosophy.',
        evidence: 'scholarship',
        sources: ['weeks-1991'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'jacob-boehme' },
      { kind: 'associated-with', target: 'doctrine-of-signatures' },
    ],
    tags: ['signatures', '1622'],
  },
  {
    id: 'doctrine-of-signatures',
    type: 'concept',
    name: 'The Doctrine of Signatures',
    epithet: 'Nature labels her own medicines',
    dates: 'Paracelsian, 16th–17th c.',
    year: 1600,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The teaching that plants and minerals bear visible signs of their hidden virtues — walnut for brain, celandine for bile — nature annotated by her Creator.',
    claims: [
      {
        text: 'Paracelsus and his followers systematized signature-reading as a key to medicinal virtue; Boehme gave it theosophic depth.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'weeks-1991'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'paracelsus' },
      { kind: 'associated-with', target: 'correspondences' },
    ],
    tags: ['medicine', 'signs'],
  },
  {
    id: 'ungrund',
    type: 'concept',
    name: 'The Ungrund',
    epithet: 'The abyss before God says I',
    dates: 'Boehme’s later works',
    year: 1620,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Boehme’s deepest word: the groundless abyss prior to all being, the eternal freedom out of which the divine will eternally gives birth to itself.',
    claims: [
      {
        text: 'In Boehme’s mature writings the Ungrund names the unfathomable no-thing from which the divine life generates itself — a conception influential on later German philosophy.',
        evidence: 'scholarship',
        sources: ['weeks-1991', 'weeks-1993'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'jacob-boehme' },
      { kind: 'part-of', target: 'christian-theosophy' },
    ],
    tags: ['abyss', 'freedom'],
  },
  {
    id: 'divine-sophia',
    type: 'concept',
    name: 'The Divine Sophia',
    epithet: 'Wisdom, the mirror in which God beholds himself',
    dates: 'biblical figure, theosophic person',
    year: 1620,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Holy Wisdom as the virgin mirror of the Godhead — central to Boehme and his heirs, sought as bride and guide by theosophers from Gichtel to the Philadelphians.',
    claims: [
      {
        text: 'Boehme casts Sophia as the mirror and body of divine wisdom lost in Adam’s fall and recovered in regeneration; the theme organizes later Christian theosophy.',
        evidence: 'scholarship',
        sources: ['versluis-1999', 'weeks-1991'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-theosophy' },
      { kind: 'associated-with', target: 'jane-lead' },
    ],
    tags: ['wisdom', 'virgin', 'mirror'],
  },
  {
    id: 'christian-theosophy',
    type: 'tradition',
    name: 'Christian Theosophy',
    epithet: 'The inner divine science of the Boehmists',
    dates: '17th–18th c.',
    year: 1650,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The current flowing from Boehme: direct vision into the divine life, Sophia-mysticism, and the rebirth of the soul — a school of the heart stretching from Görlitz to Pennsylvania.',
    claims: [
      {
        text: 'Faivre and Versluis delineate theosophy as a distinct esoteric current centred on visionary penetration of divine wisdom, with Boehme as fountainhead.',
        evidence: 'scholarship',
        sources: ['faivre-1994', 'versluis-1999'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'jacob-boehme' },
      { kind: 'influenced', target: 'louis-claude-de-saint-martin' },
    ],
    tags: ['sophia', 'rebirth', 'vision'],
  },
  {
    id: 'pansophia',
    type: 'concept',
    name: 'Pansophia',
    epithet: 'All-wisdom: every truth in one book, for everyone',
    dates: '17th c.',
    year: 1640,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The seventeenth-century dream of universal wisdom — all knowledge, divine and natural, ordered into one teachable whole — shared by Rosicrucian apologists and Comenian reformers.',
    claims: [
      {
        text: 'Pansophic schemes of universal knowledge animated the generation of Andreae, Comenius, and Hartlib.',
        evidence: 'scholarship',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'comenius' },
      { kind: 'associated-with', target: 'rosicrucianism' },
    ],
    tags: ['universal knowledge', 'reform'],
  },
  {
    id: 'abraham-von-franckenberg',
    type: 'person',
    name: 'Abraham von Franckenberg',
    epithet: 'The nobleman who kept Boehme’s flame',
    dates: '1593–1652',
    year: 1640,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Silesian noble, mystic, and Boehme’s first biographer — collector of the master’s letters, teacher of Angelus Silesius, hub of the theosophic underground.',
    claims: [
      {
        text: 'Franckenberg wrote the earliest life of Boehme and transmitted his manuscripts; his account fixed the image of the illuminated shoemaker.',
        evidence: 'documented',
        sources: ['weeks-1991', 'versluis-1999'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'jacob-boehme' },
      { kind: 'influenced', target: 'angelus-silesius' },
    ],
    tags: ['silesia', 'biographer'],
  },
  {
    id: 'angelus-silesius',
    type: 'person',
    name: 'Angelus Silesius',
    epithet: 'The wanderer whose couplets out-soar the rose',
    dates: '1624–1677',
    year: 1657,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'Johann Scheffler, physician-poet of Silesia: his Cherubinic Wanderer distills Boehmist and Eckhartian mysticism into epigrams — “The rose is without why”.',
    claims: [
      {
        text: 'Scheffler, introduced to mystical literature in Franckenberg’s circle, published the Cherubinischer Wandersmann in 1657.',
        evidence: 'documented',
        sources: ['weeks-1993'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'abraham-von-franckenberg' },
      { kind: 'part-of', target: 'christian-theosophy' },
    ],
    tags: ['epigrams', 'rose', 'silesia'],
  },
  {
    id: 'johann-georg-gichtel',
    type: 'person',
    name: 'Johann Georg Gichtel',
    epithet: 'The hermit of Amsterdam, editor of the master',
    dates: '1638–1710',
    year: 1682,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The uncompromising Boehmist who produced the great 1682 edition of Boehme’s works and led the celibate “Angelic Brethren”, wedded — he said — to Sophia alone.',
    claims: [
      {
        text: 'Gichtel edited the collected Boehme (Amsterdam 1682) and his Theosophia Practica illustrates the planetary centres in the human form.',
        evidence: 'documented',
        sources: ['versluis-1999'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'jacob-boehme', note: 'editor of the 1682 works' },
      { kind: 'associated-with', target: 'divine-sophia' },
    ],
    tags: ['amsterdam', 'edition', 'angelic brethren'],
  },
  {
    id: 'quirinus-kuhlmann',
    type: 'person',
    name: 'Quirinus Kuhlmann',
    epithet: 'The poet who marched on Moscow with a prophecy',
    dates: '1651–1689',
    year: 1689,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Silesian Boehmist poet of the Kühlpsalter, who carried his fifth-monarchy prophecies to Constantinople and Moscow — and was burned there with his books.',
    claims: [
      {
        text: 'Kuhlmann, inspired by Boehme, proclaimed a coming Jesuelite kingdom; he was executed by burning in Moscow in 1689.',
        evidence: 'documented',
        sources: ['weeks-1993', 'versluis-1999'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-theosophy' },
      { kind: 'associated-with', target: 'jacob-boehme' },
    ],
    tags: ['poet', 'prophecy', 'moscow'],
  },
  {
    id: 'john-pordage',
    type: 'person',
    name: 'John Pordage',
    epithet: 'The rector who mapped the eternal world',
    dates: '1607–1681',
    year: 1655,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The Berkshire clergyman-physician, ejected for heresy, whose visionary circle and Sophia-treatises made him England’s deepest Boehmist.',
    claims: [
      {
        text: 'Pordage was ejected from his living in 1655 after accusations of trafficking with spirits; his Theologia Mystica describes the eternal worlds opened to inner sight.',
        evidence: 'documented',
        sources: ['versluis-1999'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-theosophy' },
      { kind: 'influenced', target: 'jane-lead' },
    ],
    tags: ['berkshire', 'visionary'],
  },
  {
    id: 'jane-lead',
    type: 'person',
    name: 'Jane Lead',
    epithet: 'The widow to whom Sophia came in April',
    dates: '1624–1704',
    year: 1670,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The English visionary whose journals record Sophia’s repeated visitations, and around whose blind old age the Philadelphian Society gathered.',
    claims: [
      {
        text: 'Lead’s A Fountain of Gardens journals her Sophianic visions beginning 1670; the Philadelphian Society formed around her leadership in the 1690s.',
        evidence: 'documented',
        sources: ['versluis-1999'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'philadelphian-society' },
      { kind: 'associated-with', target: 'divine-sophia' },
    ],
    tags: ['visions', 'journals', 'london'],
  },
  {
    id: 'philadelphian-society',
    type: 'organization',
    name: 'The Philadelphian Society',
    epithet: 'Brotherly love awaiting the age of the Spirit',
    dates: '1694–c. 1704',
    year: 1694,
    era: 'early-modern',
    cluster: 'early-modern',
    summary:
      'The London fellowship of Boehmist mystics around Jane Lead — named for the angel-church of the Apocalypse, publishing visions and hymns while awaiting the universal restoration.',
    claims: [
      {
        text: 'Organized in 1694 with Francis Lee, the Society published its Theosophical Transactions and Lead’s prophetic tracts, dispersing after her death.',
        evidence: 'documented',
        sources: ['versluis-1999'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-theosophy' },
      { kind: 'located-in', target: 'london' },
    ],
    tags: ['1694', 'apocalypse', 'fellowship'],
  },
  {
    id: 'william-law',
    type: 'person',
    name: 'William Law',
    epithet: 'The devout Anglican won late to the shoemaker',
    dates: '1686–1761',
    year: 1740,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'The author of A Serious Call, converted in midlife to Boehme’s theosophy — his late works and the “Law edition” of Boehme carried the mystic into English devotion.',
    claims: [
      {
        text: 'Law’s later writings such as The Spirit of Love expound Boehmist themes; the four-volume English Boehme (1764–81) appeared under his name posthumously.',
        evidence: 'documented',
        sources: ['versluis-1999'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-theosophy' },
      { kind: 'associated-with', target: 'jacob-boehme' },
    ],
    tags: ['anglican', 'devotion'],
  },
  {
    id: 'gold-und-rosenkreuz',
    type: 'organization',
    name: 'The Gold- und Rosenkreuz',
    epithet: 'The rose-cross reborn as a graded order',
    dates: 'fl. 1757–1787',
    year: 1777,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'The German masonic-Rosicrucian order of nine alchemical grades — briefly the power behind the Prussian throne under Frederick William II, and the template for later occult hierarchies.',
    claims: [
      {
        text: 'The Golden and Rosy Cross organized higher-degree masons into nine grades with alchemical curricula; its adepts Wöllner and Bischoffwerder guided Frederick William II.',
        evidence: 'documented',
        sources: ['mcintosh-1997', 'goodrick-clarke-2008'],
      },
      {
        text: 'Its grade-structure — Zelator to Magus — was adopted a century later by the Golden Dawn.',
        evidence: 'scholarship',
        sources: ['mcintosh-1997', 'howe-1972'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'rosicrucianism' },
      { kind: 'influenced', target: 'golden-dawn' },
      { kind: 'associated-with', target: 'freemasonry' },
    ],
    tags: ['grades', 'prussia', 'alchemy'],
  },
  {
    id: 'emanuel-swedenborg',
    type: 'person',
    name: 'Emanuel Swedenborg',
    epithet: 'The assessor of mines who audited heaven',
    dates: '1688–1772',
    year: 1745,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'The Swedish natural philosopher who, after a mid-life spiritual crisis, reported decades of open commerce with heaven and hell — and whose doctrine of correspondences seeded two centuries of esoteric religion.',
    claims: [
      {
        text: 'From 1745 Swedenborg claimed continual access to the spiritual world, publishing systematic accounts including Heaven and Hell (1758).',
        evidence: 'documented',
        sources: ['swedenborg-1758', 'goodrick-clarke-2008'],
      },
      {
        text: 'His correspondence doctrine — every natural thing answering a spiritual reality — shaped Romanticism, spiritualism, and symbolist art.',
        evidence: 'scholarship',
        sources: ['goodrick-clarke-2008', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'heaven-and-hell' },
      { kind: 'influenced', target: 'correspondences', note: 'gave the doctrine its modern religious form' },
    ],
    tags: ['sweden', 'visions', 'correspondences'],
  },
  {
    id: 'heaven-and-hell',
    type: 'work',
    name: 'Heaven and Hell',
    epithet: 'A traveller’s report from the other world',
    dates: '1758',
    year: 1758,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'Swedenborg’s most read book: the geography of the afterlife “from things heard and seen” — heavens of use and love, hells chosen freely, angels who were all once human.',
    claims: [
      {
        text: 'De Caelo et Inferno (London 1758) describes the spiritual world from Swedenborg’s claimed direct experience and organizes it by correspondence.',
        evidence: 'primary',
        sources: ['swedenborg-1758'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'emanuel-swedenborg' },
      { kind: 'influenced', target: 'christian-theosophy' },
    ],
    tags: ['afterlife', '1758'],
  },
  {
    id: 'friedrich-oetinger',
    type: 'person',
    name: 'Friedrich Christoph Oetinger',
    epithet: 'The Swabian father who baptized Kabbalah Lutheran',
    dates: '1702–1782',
    year: 1765,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'The Württemberg prelate who fused Boehme, Kabbalah, and Swedenborg-criticism into a “sacred philosophy of the body” — corporeality, he taught, is the end of God’s works.',
    claims: [
      {
        text: 'Oetinger studied kabbalistic and Boehmist sources and coined the maxim that embodiment is the goal of God’s ways; he examined Swedenborg critically in print.',
        evidence: 'scholarship',
        sources: ['versluis-1999', 'goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'christian-theosophy' },
      { kind: 'studied', target: 'kabbalah' },
    ],
    tags: ['swabia', 'embodiment'],
  },
  {
    id: 'martinez-de-pasqually',
    type: 'person',
    name: 'Martinez de Pasqually',
    epithet: 'The theurgist of the Élus Coëns',
    dates: 'c. 1727–1774',
    year: 1767,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'The enigmatic founder of the Order of Knight-Masons Élus Coëns, whose ceremonial theurgy aimed at reintegrating fallen humanity with its first estate.',
    claims: [
      {
        text: 'Pasqually’s Traité de la réintégration and the Élus Coëns’ operations taught ritual invocation toward the reintegration of beings.',
        evidence: 'scholarship',
        sources: ['faivre-1994', 'goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'freemasonry', note: 'a rite within high-degree masonry' },
      { kind: 'influenced', target: 'louis-claude-de-saint-martin' },
    ],
    tags: ['elus coens', 'theurgy', 'reintegration'],
  },
  {
    id: 'louis-claude-de-saint-martin',
    type: 'person',
    name: 'Louis-Claude de Saint-Martin',
    epithet: 'The unknown philosopher of the inner way',
    dates: '1743–1803',
    year: 1782,
    era: 'enlightenment',
    cluster: 'early-modern',
    summary:
      'Pasqually’s secretary who left ceremony for the “inward way”, wrote as le Philosophe Inconnu, and translated Boehme — fountainhead of the Martinist stream.',
    claims: [
      {
        text: 'Saint-Martin turned from the Élus Coëns’ theurgy to an interior mysticism, publishing Des erreurs et de la vérité (1775) and translating Boehme in his last years.',
        evidence: 'documented',
        sources: ['faivre-1994', 'goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'martinez-de-pasqually' },
      { kind: 'translated', target: 'jacob-boehme' },
    ],
    tags: ['unknown philosopher', 'inner way'],
  },
];
