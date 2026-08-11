import type { Entity } from '../../domain/types';

export const kabbalah: Entity[] = [
  {
    id: 'kabbalah',
    type: 'tradition',
    name: 'Kabbalah',
    epithet: 'The received tradition of Jewish mystical wisdom',
    dates: 'medieval emergence; older roots',
    year: 1200,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The Jewish mystical tradition centred on the ten sefirot — the emanations through which the hidden God relates to creation — which emerged as a distinct current in medieval Provence and Spain.',
    claims: [
      {
        text: 'Kabbalah emerged as a distinct current in twelfth- and thirteenth-century Provence and Spain, centred on the ten sefirot, the emanations through which the hidden God relates to creation.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
      {
        text: 'Gershom Scholem founded its academic study; Moshe Idel’s “new perspectives” rebalanced the picture toward ecstatic and theurgic strands alongside the theosophical.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'sefer-yetzirah' },
      { kind: 'associated-with', target: 'zohar' },
      { kind: 'influenced', target: 'christian-cabala' },
    ],
    tags: ['sefirot', 'jewish mysticism', 'provence', 'spain'],
  },
  {
    id: 'sefer-yetzirah',
    type: 'work',
    name: 'Sefer Yetzirah',
    epithet: 'The Book of Formation — creation by letter and number',
    dates: 'composed 2nd–7th c. CE (disputed)',
    year: 400,
    era: 'antiquity',
    cluster: 'kabbalah',
    summary:
      'A brief, enigmatic cosmological text describing creation through the twenty-two Hebrew letters and ten primordial numbers — vocabulary the medieval kabbalists would transform.',
    claims: [
      {
        text: 'The Sefer Yetzirah describes creation through the twenty-two letters of the Hebrew alphabet and ten primordial numbers (sefirot); its date within late antiquity is disputed.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
      {
        text: 'Its vocabulary of sefirot was taken up and transformed by the medieval kabbalists into a map of divine emanation.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'influenced', target: 'tree-of-life' },
    ],
    tags: ['letters', 'numbers', 'creation', 'formation'],
  },
  {
    id: 'zohar',
    type: 'work',
    name: 'The Zohar',
    epithet: 'The Book of Radiance, crown of kabbalistic literature',
    dates: 'circulated from the 1280s',
    year: 1290,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The vast mystical commentary on the Torah that surfaced in thirteenth-century Castile — attributed by tradition to an ancient sage, assigned by scholarship to medieval Spain.',
    claims: [
      {
        text: 'The Zohar surfaced in Castile in the late thirteenth century, circulated by Moses de León, and is written largely in a distinctive literary Aramaic.',
        evidence: 'documented',
        sources: ['scholem-1941', 'zohar-pritzker'],
      },
      {
        text: 'Kabbalistic tradition attributes the work to the second-century sage Shimon bar Yoḥai.',
        evidence: 'tradition',
        sources: ['zohar-pritzker'],
      },
      {
        text: 'Scholem argued that de León was the principal author; later scholarship sees a longer, collaborative composition and redaction.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [{ kind: 'part-of', target: 'kabbalah' }],
    tags: ['radiance', 'aramaic', 'castile', 'torah'],
  },
  {
    id: 'moses-de-leon',
    type: 'person',
    name: 'Moses de León',
    epithet: 'The Castilian kabbalist behind the Book of Radiance',
    dates: 'c. 1240–1305',
    year: 1290,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The Castilian kabbalist who circulated the Zohar’s booklets — and whom modern scholarship, following Scholem, identifies as its principal author.',
    claims: [
      {
        text: 'Moses ben Shem-Tov de León of Castile circulated the Zohar’s booklets and died in 1305.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
      {
        text: 'Scholem’s analysis of the Zohar’s Aramaic and its borrowings identified de León as author; Idel and later scholars refined this toward a school of writers.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'zohar', note: 'authorship per Scholem; nuanced by later scholarship' },
      { kind: 'part-of', target: 'kabbalah' },
    ],
    tags: ['castile', 'authorship'],
  },
  {
    id: 'isaac-luria',
    type: 'person',
    name: 'Isaac Luria',
    epithet: 'The Ari of Safed, architect of cosmic repair',
    dates: '1534–1572',
    year: 1570,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'The charismatic teacher of Safed whose brief career produced one of the most influential mystical systems in Jewish history — divine contraction, the breaking of the vessels, and cosmic repair.',
    claims: [
      {
        text: 'Isaac Luria taught in Safed for roughly two years before his death in 1572, leaving almost nothing in writing; his system survives through disciples, above all Ḥayyim Vital.',
        evidence: 'documented',
        sources: ['fine-2003'],
      },
      {
        text: 'Lurianic Kabbalah — divine contraction (tsimtsum), the breaking of the vessels, and cosmic repair (tikkun) — became one of the most influential mystical systems in Jewish history.',
        evidence: 'scholarship',
        sources: ['fine-2003', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'studied', target: 'zohar' },
    ],
    tags: ['safed', 'tsimtsum', 'tikkun', 'lurianic'],
  },
  {
    id: 'tree-of-life',
    type: 'symbol',
    name: 'The Tree of Life',
    epithet: 'Ten sefirot joined by paths — a map of emanation',
    dates: 'diagrams from late medieval MSS; famous print 1516',
    year: 1516,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'The diagram arranging the ten sefirot as a tree of descent and return — developed in kabbalistic manuscripts, spread by print, and adopted centuries later as the armature of occult curricula.',
    claims: [
      {
        text: 'Diagrams arranging the ten sefirot as a “tree” developed in kabbalistic manuscripts and print; a famous early printed image appears on the title page of Portae Lucis (1516), the Latin adaptation of Gikatilla.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2013'],
      },
      {
        text: 'The Hermetic Order of the Golden Dawn organized its grades on the sefirotic tree, mapping its stations onto the order’s curriculum.',
        evidence: 'documented',
        sources: ['regardie-1940', 'howe-1972'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'kabbalah' },
      { kind: 'derived-from', target: 'sefer-yetzirah' },
      { kind: 'associated-with', target: 'golden-dawn' },
    ],
    tags: ['sefirot', 'diagram', 'emanation', 'paths'],
  },
  {
    id: 'sefer-ha-bahir',
    type: 'work',
    name: 'Sefer ha-Bahir',
    epithet: 'The book of brightness, where the sefirot first speak',
    dates: 'appeared c. 1176, Provence',
    year: 1176,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The earliest work of Kabbalah proper: a cryptic midrash surfacing in twelfth-century Provence, in which divine powers, lights, and the tree of emanation first take shape.',
    claims: [
      {
        text: 'The Bahir appeared in Provence toward the end of the twelfth century and introduces the divine powers later systematized as sefirot.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'dan-2006'],
      },
      {
        text: 'The book presents itself as ancient midrash of Rabbi Nehunya ben ha-Kanah — a traditional attribution.',
        evidence: 'tradition',
        sources: ['scholem-1974'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'influenced', target: 'zohar' },
    ],
    tags: ['provence', 'earliest', 'midrash'],
  },
  {
    id: 'isaac-the-blind',
    type: 'person',
    name: 'Isaac the Blind',
    epithet: 'The father of the kabbalists, who saw without eyes',
    dates: 'c. 1160–1235',
    year: 1200,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The Provençal master called “father of the Kabbalah”: the first to teach a doctrine of the sefirot and contemplative ascent through them, and to caution against writing the secrets down.',
    claims: [
      {
        text: 'Isaac the Blind taught contemplation of the sefirot in Provence; a letter attributed to him protests the public circulation of kabbalistic writing.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'influenced', target: 'azriel-of-gerona' },
    ],
    tags: ['provence', 'contemplation', 'secrecy'],
  },
  {
    id: 'azriel-of-gerona',
    type: 'person',
    name: 'Azriel of Gerona',
    epithet: 'The theologian of the ten emanations',
    dates: 'c. 1160–1238',
    year: 1230,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The Geronese kabbalist who gave the sefirot their philosophical grammar — emanation from Ein Sof argued in the language of Neoplatonism.',
    claims: [
      {
        text: 'Azriel’s treatises argue the necessity of the sefirot as mediating emanations of the limitless Ein Sof.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'gerona-circle' },
      { kind: 'studied', target: 'isaac-the-blind' },
    ],
    tags: ['gerona', 'ein sof', 'neoplatonism'],
  },
  {
    id: 'gerona-circle',
    type: 'organization',
    name: 'The Gerona Circle',
    epithet: 'The Catalan town where Kabbalah found its voice',
    dates: 'early 13th c.',
    year: 1230,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The group of Catalan kabbalists — Ezra, Azriel, Jacob ben Sheshet, and the young Nahmanides among them — who turned the whispered lore of Provence into a literature.',
    claims: [
      {
        text: 'The Gerona kabbalists produced the first substantial body of kabbalistic writing in the early thirteenth century.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'dan-2006'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'nahmanides' },
    ],
    tags: ['catalonia', 'school'],
  },
  {
    id: 'nahmanides',
    type: 'person',
    name: 'Nahmanides',
    epithet: 'The great rabbi who hinted at the hidden',
    dates: '1194–1270',
    year: 1250,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'Moses ben Nahman of Gerona, towering Talmudist and biblical commentator, whose guarded allusions “by way of truth” lent Kabbalah the authority of the mainstream.',
    claims: [
      {
        text: 'Nahmanides’ Torah commentary embeds kabbalistic interpretations introduced as “by the way of truth”, legitimizing the new lore.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'gerona-circle' },
    ],
    tags: ['ramban', 'commentary', 'authority'],
  },
  {
    id: 'eleazar-of-worms',
    type: 'person',
    name: 'Eleazar of Worms',
    epithet: 'The last of the Rhineland pietists',
    dates: 'c. 1176–1238',
    year: 1220,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The chief writer of the Hasidei Ashkenaz, the German-Jewish pietists whose lore of divine glory, prayer-mysticism, and name-techniques ran parallel to early Kabbalah — including instructions for the golem.',
    claims: [
      {
        text: 'Eleazar’s writings preserve the esoteric theology of the Rhineland pietists, including commentary on Sefer Yetzirah with golem-making procedure.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'sefer-yetzirah' },
      { kind: 'associated-with', target: 'golem' },
    ],
    tags: ['hasidei ashkenaz', 'worms', 'names'],
  },
  {
    id: 'abraham-abulafia',
    type: 'person',
    name: 'Abraham Abulafia',
    epithet: 'The prophet of the letters, who went to convert the pope',
    dates: '1240–c. 1291',
    year: 1280,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The ecstatic kabbalist who taught trance through letter-permutation and divine names, proclaimed himself a prophet, and set out in 1280 to speak with Pope Nicholas III.',
    claims: [
      {
        text: 'Abulafia developed a discipline of letter-combination, breathing, and vocalization aimed at prophetic experience — Idel’s “ecstatic Kabbalah”.',
        evidence: 'scholarship',
        sources: ['idel-1988'],
      },
      {
        text: 'His attempted audience with the pope in 1280 nearly ended at the stake; the pope’s sudden death spared him.',
        evidence: 'documented',
        sources: ['idel-1988', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'gematria' },
    ],
    tags: ['ecstatic', 'permutation', 'prophecy'],
  },
  {
    id: 'joseph-gikatilla',
    type: 'person',
    name: 'Joseph Gikatilla',
    epithet: 'The keeper of the gates of light',
    dates: '1248–c. 1305',
    year: 1290,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The Castilian kabbalist, student of Abulafia and colleague of Moses de León, whose Sha‘arei Orah maps the divine names to the sefirot — the classic guidebook of theosophical Kabbalah.',
    claims: [
      {
        text: 'Gikatilla’s Gates of Light presents the sefirot through the ladder of divine names, and became the standard introduction for Jewish and Christian readers alike.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'gates-of-light' },
      { kind: 'associated-with', target: 'moses-de-leon' },
    ],
    tags: ['castile', 'divine names'],
  },
  {
    id: 'gates-of-light',
    type: 'work',
    name: 'Sha‘arei Orah — The Gates of Light',
    epithet: 'Ten gates, ten lights, one ladder of names',
    dates: 'c. 1290',
    year: 1293,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'Gikatilla’s masterwork on the sefirot and the names of God — the book whose Latin translation put the Tree before Christian Europe’s eyes, engraved on its 1516 title page.',
    claims: [
      {
        text: 'The Gates of Light orders the sefirot from Malkhut upward through the divine names by which each is approached.',
        evidence: 'scholarship',
        sources: ['scholem-1974'],
      },
      {
        text: 'Paulus Ricius’ Latin Portae Lucis (1516) carried the work — and its famous tree diagram — to Christian readers.',
        evidence: 'documented',
        sources: ['scholem-1974', 'hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'joseph-gikatilla' },
      { kind: 'influenced', target: 'christian-cabala' },
    ],
    tags: ['sefirot', 'names', 'portae lucis'],
  },
  {
    id: 'hekhalot-literature',
    type: 'work',
    name: 'The Hekhalot Literature',
    epithet: 'Through the palaces, to the chariot-throne',
    dates: 'c. 3rd–8th c.',
    year: 500,
    era: 'antiquity',
    cluster: 'kabbalah',
    summary:
      'The early Jewish mystical corpus of ascent: adjurations, hymns, and perilous passage through seven heavenly palaces to the vision of the throne — Kabbalah’s deepest root.',
    claims: [
      {
        text: 'The Hekhalot texts describe visionary ascent through palaces guarded by angels, with hymns and seals as passwords — Scholem’s “Merkabah mysticism”.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'merkabah-mysticism' },
      { kind: 'influenced', target: 'kabbalah' },
    ],
    tags: ['palaces', 'ascent', 'hymns'],
  },
  {
    id: 'merkabah-mysticism',
    type: 'tradition',
    name: 'Merkabah Mysticism',
    epithet: 'The way of the chariot, oldest of the paths',
    dates: 'late antiquity',
    year: 400,
    era: 'antiquity',
    cluster: 'kabbalah',
    summary:
      'The earliest stream of Jewish mysticism, meditating on Ezekiel’s chariot-throne — visionary ascent hedged with danger, the prehistory of all later Jewish esotericism.',
    claims: [
      {
        text: 'Scholem placed Merkabah mysticism as the first major phase of Jewish mysticism, flourishing in late antiquity.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
      {
        text: 'The Talmud’s story of the four who entered pardes preserves the tradition’s sense of peril.',
        evidence: 'primary',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'influenced', target: 'kabbalah' },
      { kind: 'associated-with', target: 'hekhalot-literature' },
    ],
    tags: ['chariot', 'ezekiel', 'pardes'],
  },
  {
    id: 'shiur-komah',
    type: 'work',
    name: 'Shi‘ur Komah',
    epithet: 'The measure of the body no measure can hold',
    dates: 'late antiquity',
    year: 600,
    era: 'antiquity',
    cluster: 'kabbalah',
    summary:
      'The startling early text that gives cosmic measurements of the divine body, limb by limb — scandal to philosophers, secret scripture to mystics.',
    claims: [
      {
        text: 'The Shi‘ur Komah assigns immense measures and secret names to the limbs of the Creator; Maimonides condemned it, mystics treasured it.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'merkabah-mysticism' },
      { kind: 'associated-with', target: 'shekhinah' },
    ],
    tags: ['divine body', 'measures'],
  },
  {
    id: 'sefer-raziel',
    type: 'work',
    name: 'Sefer Raziel ha-Malakh',
    epithet: 'The angel’s book, given to Adam at the gate',
    dates: 'compiled 13th c.; printed 1701',
    year: 1701,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The famous compendium of angelic names, seals, and amulets said to have been handed to Adam by the angel Raziel — kept in homes for centuries as protection against fire.',
    claims: [
      {
        text: 'Sefer Raziel compiles older magical and cosmological material; the Amsterdam 1701 printing spread the belief that the book protects the house that holds it.',
        evidence: 'scholarship',
        sources: ['scholem-1974', 'hanegraaff-2005'],
      },
      {
        text: 'Its frame — the angel Raziel delivering the book to Adam — is legend.',
        evidence: 'legend',
        sources: ['scholem-1974'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'gematria' },
    ],
    tags: ['amulets', 'angel', 'protection'],
  },
  {
    id: 'expulsion-1492',
    type: 'event',
    name: 'The Expulsion from Spain',
    epithet: 'The catastrophe that scattered the secret',
    dates: '1492',
    year: 1492,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'The edict of 1492 driving the Jews from Spain — the trauma that carried Kabbalah across the Mediterranean and, in Scholem’s reading, turned it toward exile and redemption.',
    claims: [
      {
        text: 'The Alhambra Decree of March 1492 expelled unconverted Jews from Castile and Aragon; Sephardi exiles carried kabbalistic learning to Italy, North Africa, and the Ottoman lands.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
      {
        text: 'Scholem read Lurianic Kabbalah as a response to the expulsion — a thesis later scholarship has qualified.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'influenced', target: 'safed' },
      { kind: 'associated-with', target: 'kabbalah' },
    ],
    tags: ['1492', 'exile', 'sepharad'],
  },
  {
    id: 'safed',
    type: 'place',
    name: 'Safed',
    epithet: 'The hill town where Kabbalah caught fire',
    dates: '16th c. golden age',
    year: 1550,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'The Galilean town that gathered the exiles’ children — Karo, Cordovero, Alkabetz, Luria, Vital — into the most intense mystical community in Jewish history.',
    claims: [
      {
        text: 'Sixteenth-century Safed hosted the circle that produced the Shulhan Arukh, Lekha Dodi, Cordoverian systematics, and Lurianic Kabbalah.',
        evidence: 'documented',
        sources: ['fine-2003'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'isaac-luria' },
      { kind: 'associated-with', target: 'moses-cordovero' },
    ],
    tags: ['galilee', 'community', 'golden age'],
  },
  {
    id: 'moses-cordovero',
    type: 'person',
    name: 'Moses Cordovero',
    epithet: 'The great systematizer of the orchard',
    dates: '1522–1570',
    year: 1548,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Safed’s master theologian before Luria: his Pardes Rimmonim gathered all prior Kabbalah into one coherent system of the sefirot and their workings.',
    claims: [
      {
        text: 'Cordovero’s Pardes Rimmonim (completed 1548) systematized kabbalistic doctrine; Luria arrived in Safed shortly before Cordovero’s death.',
        evidence: 'documented',
        sources: ['fine-2003', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'pardes-rimmonim' },
      { kind: 'influenced', target: 'isaac-luria' },
    ],
    tags: ['safed', 'system', 'pardes'],
  },
  {
    id: 'pardes-rimmonim',
    type: 'work',
    name: 'Pardes Rimmonim',
    epithet: 'The orchard of pomegranates, mapped row by row',
    dates: '1548',
    year: 1549,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Cordovero’s “Orchard of Pomegranates”: thirty-two gates ordering every prior doctrine of the sefirot, lights, and names into a single architecture.',
    claims: [
      {
        text: 'The Pardes harmonizes Zoharic and philosophical currents into a comprehensive kabbalistic system of thirty-two gates.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'moses-cordovero' },
      { kind: 'derived-from', target: 'zohar' },
    ],
    tags: ['system', 'thirty-two gates'],
  },
  {
    id: 'solomon-alkabetz',
    type: 'person',
    name: 'Solomon Alkabetz',
    epithet: 'The poet who welcomed the Sabbath bride',
    dates: 'c. 1505–1584',
    year: 1540,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Safed kabbalist and poet, author of Lekha Dodi — the hymn that leads congregations out to greet the Sabbath as a bride, Kabbalah sung into every synagogue.',
    claims: [
      {
        text: 'Alkabetz composed Lekha Dodi in Safed; the practice of going out to greet the Sabbath enacts the welcome of the Shekhinah.',
        evidence: 'documented',
        sources: ['fine-2003'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'safed' },
      { kind: 'associated-with', target: 'shekhinah' },
    ],
    tags: ['lekha dodi', 'hymn', 'sabbath'],
  },
  {
    id: 'joseph-karo',
    type: 'person',
    name: 'Joseph Karo',
    epithet: 'The lawgiver visited by a heavenly teacher',
    dates: '1488–1575',
    year: 1555,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Author of the Shulhan Arukh, the standard code of Jewish law — and keeper of a mystical diary recording the nightly speech of a maggid, the personified Mishnah.',
    claims: [
      {
        text: 'Karo’s Maggid Mesharim records revelations from a celestial mentor over decades — law and mysticism in one life.',
        evidence: 'primary',
        sources: ['fine-2003', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'safed' },
      { kind: 'associated-with', target: 'kabbalah' },
    ],
    tags: ['law', 'maggid', 'diary'],
  },
  {
    id: 'hayyim-vital',
    type: 'person',
    name: 'Hayyim Vital',
    epithet: 'The disciple who bottled the master’s lightning',
    dates: '1542–1620',
    year: 1572,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Luria’s chief disciple and jealous scribe: nearly everything known of Lurianic Kabbalah descends from Vital’s vast recensions, guarded during his life and copied against his will.',
    claims: [
      {
        text: 'Luria published almost nothing; Vital’s Etz Hayyim and related recensions are the principal record of his teaching.',
        evidence: 'scholarship',
        sources: ['fine-2003'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'isaac-luria' },
      { kind: 'wrote', target: 'etz-hayyim' },
    ],
    tags: ['scribe', 'safed', 'recensions'],
  },
  {
    id: 'etz-hayyim',
    type: 'work',
    name: 'Etz Hayyim',
    epithet: 'The tree of life, written down at last',
    dates: 'late 16th c.',
    year: 1590,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Vital’s great exposition of Luria’s system — contraction, shattering, and repair; the worlds and the partzufim — the canon of Lurianic Kabbalah.',
    claims: [
      {
        text: 'Etz Hayyim expounds tzimtzum, shevirah, and tikkun as the drama of creation — the framework of Lurianic cosmology.',
        evidence: 'scholarship',
        sources: ['fine-2003', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'hayyim-vital' },
      { kind: 'part-of', target: 'lurianic-kabbalah' },
    ],
    tags: ['luria', 'cosmology', 'canon'],
  },
  {
    id: 'lurianic-kabbalah',
    type: 'tradition',
    name: 'Lurianic Kabbalah',
    epithet: 'Creation by withdrawal, catastrophe, and repair',
    dates: 'from c. 1570',
    year: 1572,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'The system taught by Isaac Luria in Safed: God contracts to make room for the world, the vessels shatter under the light, and humanity’s task is the gathering of sparks.',
    claims: [
      {
        text: 'Lurianic doctrine — tzimtzum, shevirat ha-kelim, tikkun — spread through the Jewish world within two generations of Luria’s death.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'isaac-luria' },
      { kind: 'influenced', target: 'hasidism' },
      { kind: 'influenced', target: 'shabbetai-tzvi' },
    ],
    tags: ['safed', 'sparks', 'system'],
  },
  {
    id: 'sefirot',
    type: 'concept',
    name: 'The Sefirot',
    epithet: 'Ten lights by which the hidden God is known',
    dates: 'named in Sefer Yetzirah',
    year: 1200,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The ten emanations — Keter to Malkhut — through which Ein Sof unfolds into creation: the alphabet of all kabbalistic thought.',
    claims: [
      {
        text: 'Sefer Yetzirah names ten sefirot belimah; medieval Kabbalah develops them into the structure of divine emanation.',
        evidence: 'scholarship',
        sources: ['scholem-1974', 'dan-2006'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'sefer-yetzirah' },
      { kind: 'symbol-of', target: 'kabbalah' },
    ],
    tags: ['emanation', 'ten'],
  },
  {
    id: 'ein-sof',
    type: 'concept',
    name: 'Ein Sof',
    epithet: 'The Without-End, before all names',
    dates: 'coined 13th c.',
    year: 1230,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The Infinite itself — God beyond attribute, thought, or name — from whose concealment the sefirot stream forth like flame from a coal.',
    claims: [
      {
        text: 'The term Ein Sof for the unknowable Godhead enters kabbalistic usage among the Provençal and Geronese masters.',
        evidence: 'scholarship',
        sources: ['scholem-1974'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'sefirot' },
    ],
    tags: ['infinite', 'godhead'],
  },
  {
    id: 'shekhinah',
    type: 'concept',
    name: 'The Shekhinah',
    epithet: 'The indwelling presence, exiled with her people',
    dates: 'rabbinic term, kabbalistic person',
    year: 1290,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The divine presence, in Kabbalah the feminine last sefirah — daughter, bride, and queen — whose exile and reunion with the Holy One is the drama behind every commandment.',
    claims: [
      {
        text: 'The Zohar personifies the Shekhinah as the feminine tenth sefirah, exiled with Israel and reunited through righteous deeds.',
        evidence: 'scholarship',
        sources: ['zohar-pritzker', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'sefirot' },
      { kind: 'associated-with', target: 'zohar' },
    ],
    tags: ['presence', 'feminine', 'exile'],
  },
  {
    id: 'tzimtzum',
    type: 'concept',
    name: 'Tzimtzum',
    epithet: 'The withdrawal that made room for a world',
    dates: 'Lurianic, 16th c.',
    year: 1570,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Luria’s founding paradox: the Infinite contracts itself to open a space in which finite creation can stand — creation begins with divine self-limitation.',
    claims: [
      {
        text: 'In Lurianic teaching Ein Sof withdraws from a primordial point, leaving a vacated space into which the ray of creation enters.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'lurianic-kabbalah' },
      { kind: 'associated-with', target: 'ein-sof' },
    ],
    tags: ['contraction', 'creation'],
  },
  {
    id: 'shevirat-ha-kelim',
    type: 'concept',
    name: 'Shevirat ha-Kelim',
    epithet: 'The breaking of the vessels',
    dates: 'Lurianic, 16th c.',
    year: 1570,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'The primal catastrophe of the Lurianic myth: the vessels meant to hold the divine light shatter, and sparks fall captive into the husks of matter.',
    claims: [
      {
        text: 'Lurianic cosmology teaches that the lower vessels broke under the emanated light, scattering sparks that await release.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'lurianic-kabbalah' },
      { kind: 'associated-with', target: 'kelipot' },
    ],
    tags: ['catastrophe', 'sparks'],
  },
  {
    id: 'tikkun',
    type: 'concept',
    name: 'Tikkun',
    epithet: 'The mending of the worlds, deed by deed',
    dates: 'Lurianic, 16th c.',
    year: 1570,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Repair: the human vocation in the Lurianic cosmos — every commandment, prayer, and intention raising fallen sparks toward the restoration of all things.',
    claims: [
      {
        text: 'In Lurianic Kabbalah the performance of mitzvot with mystical intention effects tikkun, the raising of sparks and repair of the divine structure.',
        evidence: 'scholarship',
        sources: ['fine-2003', 'scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'lurianic-kabbalah' },
      { kind: 'associated-with', target: 'shevirat-ha-kelim' },
    ],
    tags: ['repair', 'sparks', 'intention'],
  },
  {
    id: 'kelipot',
    type: 'concept',
    name: 'The Kelipot',
    epithet: 'Husks that imprison the fallen light',
    dates: 'Zoharic and Lurianic',
    year: 1300,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The shells or husks of the demonic “other side” — coverings of impurity in which, after the breaking, sparks of holiness lie captive awaiting redemption.',
    claims: [
      {
        text: 'Zoharic and Lurianic texts describe the kelipot and the sitra ahra, the other side, as the domain holding captive sparks.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'zohar-pritzker'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'lurianic-kabbalah' },
      { kind: 'associated-with', target: 'zohar' },
    ],
    tags: ['husks', 'sitra ahra'],
  },
  {
    id: 'adam-kadmon',
    type: 'concept',
    name: 'Adam Kadmon',
    epithet: 'The primordial man, first vessel of the light',
    dates: 'Lurianic elaboration',
    year: 1570,
    era: 'renaissance',
    cluster: 'kabbalah',
    summary:
      'Primordial Adam: the first configuration of divine light after the tzimtzum, from whose eyes, ears, and mouth the lights of the worlds stream out.',
    claims: [
      {
        text: 'In Lurianic cosmogony Adam Kadmon precedes the four worlds; lights issuing from his features generate the vessels of creation.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'lurianic-kabbalah' },
      { kind: 'associated-with', target: 'four-worlds' },
    ],
    tags: ['primordial', 'lights'],
  },
  {
    id: 'four-worlds',
    type: 'concept',
    name: 'The Four Worlds',
    epithet: 'Emanation, creation, formation, action',
    dates: 'medieval systematization',
    year: 1300,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The kabbalistic ladder of worlds — Atzilut, Beriah, Yetzirah, Asiyah — through which divinity descends into manifestation and the soul climbs home.',
    claims: [
      {
        text: 'The scheme of four worlds became standard in kabbalistic literature, each containing its own tree of sefirot.',
        evidence: 'scholarship',
        sources: ['scholem-1974'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'tree-of-life' },
    ],
    tags: ['ladder', 'worlds'],
  },
  {
    id: 'gilgul',
    type: 'concept',
    name: 'Gilgul',
    epithet: 'The wheel of souls, turning through lives',
    dates: 'from the Bahir onward',
    year: 1200,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'The transmigration of souls: hinted in the Bahir, elaborated in Safed into genealogies of souls returning to complete their repairs.',
    claims: [
      {
        text: 'Gilgul appears in the Bahir and becomes central in Safed, where Vital’s Sha‘ar ha-Gilgulim traces soul-histories.',
        evidence: 'scholarship',
        sources: ['scholem-1974', 'fine-2003'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'hayyim-vital' },
    ],
    tags: ['reincarnation', 'souls'],
  },
  {
    id: 'devekut',
    type: 'concept',
    name: 'Devekut',
    epithet: 'Cleaving to God, thought to thought',
    dates: 'medieval and hasidic',
    year: 1250,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'Cleaving: the contemplative union of the soul’s thought with the divine — the summit of kabbalistic practice, later the daily ideal of Hasidism.',
    claims: [
      {
        text: 'Idel identified devekut, mystical cleaving, as a central goal already in ecstatic Kabbalah, later democratized by Hasidism.',
        evidence: 'scholarship',
        sources: ['idel-1988'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'hasidism' },
    ],
    tags: ['union', 'contemplation'],
  },
  {
    id: 'gematria',
    type: 'concept',
    name: 'Gematria',
    epithet: 'The arithmetic hidden in the alphabet',
    dates: 'rabbinic technique, mystical art',
    year: 1280,
    era: 'medieval',
    cluster: 'kabbalah',
    summary:
      'Interpretation by number: every Hebrew letter counts, and words of equal sum unlock one another — the engine of Abulafian meditation and endless exegesis.',
    claims: [
      {
        text: 'Gematria, with notarikon and temurah, forms the hermeneutic toolkit of ecstatic Kabbalah and of the Hasidei Ashkenaz.',
        evidence: 'scholarship',
        sources: ['scholem-1974', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'abraham-abulafia' },
    ],
    tags: ['letters', 'numbers', 'exegesis'],
  },
  {
    id: 'golem',
    type: 'concept',
    name: 'The Golem',
    epithet: 'Clay quickened by the letters of the Name',
    dates: 'legend crystallized 17th–19th c.',
    year: 1600,
    era: 'early-modern',
    cluster: 'kabbalah',
    summary:
      'The man of clay animated through Sefer Yetzirah’s letter-combinations — a mystical exercise in the sources, a servant and protector in the later legends of Chełm and Prague.',
    claims: [
      {
        text: 'Medieval commentaries on Sefer Yetzirah, notably of the Hasidei Ashkenaz, treat golem-making as a ritual of letter-permutation.',
        evidence: 'scholarship',
        sources: ['scholem-1974'],
      },
      {
        text: 'The famous attribution of a golem to Rabbi Judah Loew of Prague is a legend first attested centuries after his death.',
        evidence: 'legend',
        sources: ['scholem-1974'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'sefer-yetzirah' },
      { kind: 'associated-with', target: 'prague' },
    ],
    tags: ['clay', 'letters', 'prague'],
  },
  {
    id: 'israel-sarug',
    type: 'person',
    name: 'Israel Sarug',
    epithet: 'The missionary who carried Luria to Europe',
    dates: 'fl. 1590–1610',
    year: 1600,
    era: 'early-modern',
    cluster: 'kabbalah',
    summary:
      'The itinerant kabbalist who taught a philosophized Lurianism across Italy and Europe — claiming Luria’s mantle, and giving the system the form Christian Europe would meet.',
    claims: [
      {
        text: 'Sarug spread a distinctive version of Lurianic doctrine in Italy around 1600; scholarship doubts he studied with Luria himself.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'lurianic-kabbalah' },
      { kind: 'influenced', target: 'kabbala-denudata' },
    ],
    tags: ['italy', 'transmission'],
  },
  {
    id: 'knorr-von-rosenroth',
    type: 'person',
    name: 'Christian Knorr von Rosenroth',
    epithet: 'The baron who unveiled Kabbalah in Latin',
    dates: '1636–1689',
    year: 1677,
    era: 'early-modern',
    cluster: 'kabbalah',
    summary:
      'The Silesian scholar whose Kabbala Denudata rendered Zoharic and Lurianic texts into Latin — the doorway through which Europe’s savants, and later occultists, entered Kabbalah.',
    claims: [
      {
        text: 'Knorr’s Kabbala Denudata (1677–84) made substantial kabbalistic sources available in Latin for the first time.',
        evidence: 'documented',
        sources: ['scholem-1974', 'hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'kabbala-denudata' },
      { kind: 'associated-with', target: 'christian-cabala' },
    ],
    tags: ['latin', 'sulzbach'],
  },
  {
    id: 'kabbala-denudata',
    type: 'work',
    name: 'Kabbala Denudata',
    epithet: 'Kabbalah unveiled for the Latin west',
    dates: '1677–1684',
    year: 1677,
    era: 'early-modern',
    cluster: 'kabbalah',
    summary:
      'Knorr von Rosenroth’s great Latin anthology of kabbalistic texts — the standard European source for two centuries, and the quarry from which Mathers cut his Kabbalah Unveiled.',
    claims: [
      {
        text: 'The anthology translates Zoharic sections and Lurianic treatises; Mathers’ 1887 English version descends from it directly.',
        evidence: 'documented',
        sources: ['scholem-1974', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'knorr-von-rosenroth' },
      { kind: 'influenced', target: 'golden-dawn' },
    ],
    tags: ['anthology', 'latin', '1677'],
  },
  {
    id: 'shabbetai-tzvi',
    type: 'person',
    name: 'Shabbetai Tzvi',
    epithet: 'The messiah who apostatized',
    dates: '1626–1676',
    year: 1666,
    era: 'early-modern',
    cluster: 'kabbalah',
    summary:
      'The Smyrna kabbalist proclaimed messiah in 1665, who set the Jewish world alight — and converted to Islam under the sultan’s threat, leaving a movement that would not die.',
    claims: [
      {
        text: 'Shabbetai Tzvi was proclaimed messiah in 1665, gathering mass support across the diaspora, and converted to Islam in September 1666.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
      {
        text: 'Scholem read Sabbatianism as Lurianic messianism erupting into history — its paradoxical theology built on the fallen messiah.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'nathan-of-gaza' },
      { kind: 'part-of', target: 'kabbalah' },
    ],
    tags: ['messiah', '1666', 'apostasy'],
  },
  {
    id: 'nathan-of-gaza',
    type: 'person',
    name: 'Nathan of Gaza',
    epithet: 'The prophet who explained the inexplicable',
    dates: '1643–1680',
    year: 1665,
    era: 'early-modern',
    cluster: 'kabbalah',
    summary:
      'The young kabbalist whose visions authenticated Shabbetai Tzvi — and whose theology of the messiah’s descent into the husks turned even apostasy into doctrine.',
    claims: [
      {
        text: 'Nathan proclaimed Shabbetai messiah after a vision in 1665 and produced the movement’s theological literature, reworking Lurianic categories.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'shabbetai-tzvi' },
      { kind: 'derived-from', target: 'lurianic-kabbalah' },
    ],
    tags: ['prophet', 'gaza', 'theology'],
  },
  {
    id: 'jacob-frank',
    type: 'person',
    name: 'Jacob Frank',
    epithet: 'The darkest turn of the messianic wheel',
    dates: '1726–1791',
    year: 1760,
    era: 'enlightenment',
    cluster: 'kabbalah',
    summary:
      'The last great Sabbatian pretender, who led his followers through deliberate transgression into mass baptism — the antinomian end-point of the messianic heresy.',
    claims: [
      {
        text: 'Frank claimed the mantle of Shabbetai Tzvi; his sect disputed the Talmud publicly and accepted baptism in Lwów in 1759.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'shabbetai-tzvi' },
      { kind: 'part-of', target: 'kabbalah' },
    ],
    tags: ['sabbatian', 'antinomian', 'poland'],
  },
  {
    id: 'hasidism',
    type: 'tradition',
    name: 'Hasidism',
    epithet: 'The mystical revival that filled the marketplace',
    dates: 'from c. 1740',
    year: 1750,
    era: 'enlightenment',
    cluster: 'kabbalah',
    summary:
      'The popular mystical movement of Eastern Europe: Lurianic Kabbalah turned inward and outward at once — joy, prayer, and the rebbe’s court in place of the scholar’s seclusion.',
    claims: [
      {
        text: 'Hasidism, spreading from the circle of the Baal Shem Tov, recast kabbalistic ideas as a popular spirituality of devekut and joy.',
        evidence: 'scholarship',
        sources: ['scholem-1941', 'idel-1988'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'lurianic-kabbalah' },
      { kind: 'associated-with', target: 'baal-shem-tov' },
    ],
    tags: ['revival', 'eastern europe', 'joy'],
  },
  {
    id: 'baal-shem-tov',
    type: 'person',
    name: 'The Baal Shem Tov',
    epithet: 'Master of the good name, founder by fireside tale',
    dates: 'c. 1700–1760',
    year: 1740,
    era: 'enlightenment',
    cluster: 'kabbalah',
    summary:
      'Israel ben Eliezer, the charismatic healer and teacher of the Carpathians around whom Hasidism crystallized — known almost wholly through his disciples’ tales.',
    claims: [
      {
        text: 'The Besht left almost no writings; his teaching survives in disciples’ collections and the hagiography Shivhei ha-Besht.',
        evidence: 'scholarship',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'hasidism' },
      { kind: 'associated-with', target: 'devekut' },
    ],
    tags: ['besht', 'healer', 'tales'],
  },
  {
    id: 'moshe-hayyim-luzzatto',
    type: 'person',
    name: 'Moshe Hayyim Luzzatto',
    epithet: 'The Paduan prodigy with a maggid of his own',
    dates: '1707–1746',
    year: 1735,
    era: 'enlightenment',
    cluster: 'kabbalah',
    summary:
      'The Italian kabbalist, poet, and moralist — visited, he recorded, by a heavenly maggid; hounded by rabbinic opponents; author of the ethical classic Mesillat Yesharim.',
    claims: [
      {
        text: 'Luzzatto recorded revelations from a maggid and led a kabbalistic circle in Padua; rabbinic authorities forced him to abandon such writing.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'kabbalah' },
      { kind: 'associated-with', target: 'lurianic-kabbalah' },
    ],
    tags: ['ramhal', 'padua', 'ethics'],
  },
];
