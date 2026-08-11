import type { Entity } from '../../domain/types';

export const scholarship: Entity[] = [
  {
    id: 'frances-yates',
    type: 'person',
    name: 'Frances Yates',
    epithet: 'The historian who made Hermes a research programme',
    dates: '1899–1981',
    year: 1964,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Warburg Institute historian whose Giordano Bruno and the Hermetic Tradition re-drew the map of Renaissance intellectual history and opened esoteric currents to serious study.',
    claims: [
      {
        text: 'A historian at the Warburg Institute whose Giordano Bruno and the Hermetic Tradition (1964) re-drew the map of Renaissance intellectual history.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
      {
        text: 'The “Yates thesis” — that Hermeticism helped incubate the Scientific Revolution — provoked decades of productive debate and qualification.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'bruno-hermetic-tradition' },
      { kind: 'member-of', target: 'warburg-institute' },
      { kind: 'studied', target: 'giordano-bruno' },
      { kind: 'studied', target: 'rosicrucianism' },
    ],
    tags: ['warburg', 'historian', 'yates thesis'],
  },
  {
    id: 'bruno-hermetic-tradition',
    type: 'work',
    name: 'Giordano Bruno and the Hermetic Tradition',
    epithet: 'The book that founded a field',
    dates: '1964',
    year: 1964,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Yates’s 1964 study, telling the story from Ficino’s translation to Casaubon’s redating with Bruno at its centre — the book that made “the Hermetic tradition” a scholarly object.',
    claims: [
      {
        text: 'Published by Routledge in 1964, it narrates the arc from Ficino’s translation of the Hermetica to Casaubon’s redating, with Bruno at its centre.',
        evidence: 'documented',
        sources: ['yates-1964'],
      },
      {
        text: 'Hanegraaff credits the book with making the “Hermetic tradition” a research programme, while documenting how later scholars broke it into plural currents.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'giordano-bruno' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['1964', 'routledge', 'historiography'],
  },
  {
    id: 'warburg-institute',
    type: 'organization',
    name: 'The Warburg Institute',
    epithet: 'Where the afterlife of antiquity became a discipline',
    dates: 'Hamburg origins; London since 1933',
    year: 1933,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The research institute grown from Aby Warburg’s library, whose programme — the survival of antiquity in Western culture — made magic and astrology respectable objects of historical study.',
    claims: [
      {
        text: 'Grown from Aby Warburg’s library in Hamburg, the institute moved to London in 1933; its programme made unfashionable subjects like magic and astrology respectable objects of study.',
        evidence: 'documented',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'located-in', target: 'london' },
      { kind: 'associated-with', target: 'frances-yates' },
    ],
    tags: ['library', 'hamburg', 'london', 'institute'],
  },
  {
    id: 'antoine-faivre',
    type: 'person',
    name: 'Antoine Faivre',
    epithet: 'The professor who gave the field its first definition',
    dates: '1934–2021',
    year: 1994,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Holder of the Sorbonne chair for the history of esoteric currents, whose four “intrinsic characteristics” gave the academic study of Western esotericism its first standard analytical frame.',
    claims: [
      {
        text: 'Faivre held the chair for the history of esoteric and mystical currents at the École Pratique des Hautes Études (Sorbonne), the first professorship of its kind.',
        evidence: 'documented',
        sources: ['faivre-1994', 'hanegraaff-2012'],
      },
      {
        text: 'His definition by four intrinsic characteristics — correspondences, living nature, imagination and mediations, and transmutation — gave the field its first standard analytical frame.',
        evidence: 'scholarship',
        sources: ['faivre-1994'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'western-esotericism-field' },
      { kind: 'studied', target: 'correspondences' },
    ],
    tags: ['sorbonne', 'definition', 'characteristics'],
  },
  {
    id: 'wouter-hanegraaff',
    type: 'person',
    name: 'Wouter Hanegraaff',
    epithet: 'The historian of rejected knowledge',
    dates: 'b. 1961',
    year: 2012,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Professor at the University of Amsterdam’s centre for the History of Hermetic Philosophy, who reframed “esotericism” as knowledge rejected by both orthodoxy and Enlightenment reason.',
    claims: [
      {
        text: 'Professor at the University of Amsterdam’s centre for the History of Hermetic Philosophy and Related Currents (founded 1999); author of Esotericism and the Academy (2012).',
        evidence: 'documented',
        sources: ['hanegraaff-2012'],
      },
      {
        text: 'He reframed “esotericism” as a category produced by centuries of polemics — knowledge rejected by both church orthodoxy and Enlightenment reason.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'western-esotericism-field' },
      { kind: 'studied', target: 'hermeticism' },
    ],
    tags: ['amsterdam', 'rejected knowledge', 'historiography'],
  },
  {
    id: 'western-esotericism-field',
    type: 'tradition',
    name: 'The Academic Study of Western Esotericism',
    epithet: 'Neither practicing nor debunking — documenting',
    dates: 'chairs from 1965',
    year: 1965,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The scholarly field that studies esoteric currents historically and critically, with dedicated chairs in Paris, Amsterdam, and beyond — the discipline this museum is built upon.',
    claims: [
      {
        text: 'A dedicated chair was created at the École Pratique des Hautes Études in 1965 (François Secret; Faivre from 1979); Amsterdam (1999) and other centres followed, with journals and learned societies.',
        evidence: 'documented',
        sources: ['hanegraaff-2012'],
      },
      {
        text: 'The field studies esoteric currents historically and critically — neither practicing nor debunking, but documenting and interpreting.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2013'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'hermeticism' },
      { kind: 'studied', target: 'kabbalah' },
      { kind: 'associated-with', target: 'gershom-scholem', note: 'his philological programme was the template' },
    ],
    tags: ['discipline', 'chairs', 'method'],
  },
  {
    id: 'gershom-scholem',
    type: 'person',
    name: 'Gershom Scholem',
    epithet: 'The philologist who made mysticism a science',
    dates: '1897–1982',
    year: 1941,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Professor at the Hebrew University of Jerusalem, founder of the academic study of Kabbalah, whose philological method became the template for studying esoteric currents.',
    claims: [
      {
        text: 'Professor at the Hebrew University of Jerusalem; Major Trends in Jewish Mysticism (1941) established the academic study of Kabbalah.',
        evidence: 'documented',
        sources: ['scholem-1941'],
      },
      {
        text: 'His philological method — dating texts, identifying authors, mapping schools — set the template later applied to other esoteric currents.',
        evidence: 'scholarship',
        sources: ['idel-1988', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'kabbalah' },
      { kind: 'studied', target: 'zohar' },
    ],
    tags: ['jerusalem', 'philology', 'kabbalah studies'],
  },
  {
    id: 'aby-warburg',
    type: 'person',
    name: 'Aby Warburg',
    epithet: 'The art historian haunted by the survival of the gods',
    dates: '1866–1929',
    year: 1920,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Hamburg art historian whose obsession with the afterlife of pagan antiquity — astrology, ritual, the pathos of the image — created the library and method from which the whole field descends.',
    claims: [
      {
        text: 'Warburg studied the survival (Nachleben) of ancient astrological and ritual imagery in Renaissance art, treating magic and astrology as central, not marginal.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
      {
        text: 'His private research library became the Warburg Institute, carrier of his interdisciplinary method.',
        evidence: 'documented',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'warburg-institute' },
      { kind: 'studied', target: 'correspondences' },
    ],
    tags: ['hamburg', 'nachleben', 'images'],
  },
  {
    id: 'lynn-thorndike',
    type: 'person',
    name: 'Lynn Thorndike',
    epithet: 'The historian who catalogued eight centuries of magic',
    dates: '1882–1965',
    year: 1923,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The American historian whose eight-volume History of Magic and Experimental Science insisted that magic and science grew together, and mapped the manuscript sources for generations after.',
    claims: [
      {
        text: 'Thorndike’s A History of Magic and Experimental Science (1923–58) argued that magic and experimental science were historically intertwined.',
        evidence: 'documented',
        sources: ['thorndike-1923'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'history-of-magic-experimental-science' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['columbia', 'magic and science', 'sources'],
  },
  {
    id: 'history-of-magic-experimental-science',
    type: 'work',
    name: 'A History of Magic and Experimental Science',
    epithet: 'Eight volumes tracing two sisters, magic and science',
    dates: '1923–1958',
    year: 1923,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Thorndike’s monumental survey from the Roman Empire to the seventeenth century — a foundational reference that treated magical texts as serious historical evidence.',
    claims: [
      {
        text: 'The eight volumes survey magic and science together across the medieval and early modern periods, drawing extensively on unpublished manuscripts.',
        evidence: 'documented',
        sources: ['thorndike-1923'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'lynn-thorndike' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['survey', 'reference', 'manuscripts'],
  },
  {
    id: 'd-p-walker',
    type: 'person',
    name: 'D. P. Walker',
    epithet: 'The scholar who anatomized Ficino’s magic',
    dates: '1914–1985',
    year: 1958,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Warburg historian whose Spiritual and Demonic Magic distinguished the “spiritual” natural magic of Ficino from demonic conjuring, sharpening how scholars read Renaissance magic.',
    claims: [
      {
        text: 'Walker’s Spiritual and Demonic Magic from Ficino to Campanella (1958) analyzed the theory of Ficinian spiritus-magic and its theological hazards.',
        evidence: 'documented',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'spiritual-and-demonic-magic' },
      { kind: 'member-of', target: 'warburg-institute' },
    ],
    tags: ['warburg', 'ficino', 'spiritus'],
  },
  {
    id: 'spiritual-and-demonic-magic',
    type: 'work',
    name: 'Spiritual and Demonic Magic from Ficino to Campanella',
    epithet: 'The line between drawing down spirit and summoning demons',
    dates: '1958',
    year: 1958,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Walker’s classic study of Renaissance magical theory — how a magic of subtle spiritus could be defended as natural, and where it slid toward the demonic.',
    claims: [
      {
        text: 'The book traces the theory and controversy of spiritus-based magic from Ficino through Campanella.',
        evidence: 'documented',
        sources: ['walker-1958'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'd-p-walker' },
      { kind: 'studied', target: 'natural-magic' },
    ],
    tags: ['1958', 'renaissance magic', 'spiritus'],
  },
  {
    id: 'moshe-idel',
    type: 'person',
    name: 'Moshe Idel',
    epithet: 'The scholar who reopened Scholem’s Kabbalah',
    dates: 'b. 1947',
    year: 1988,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Jerusalem scholar whose Kabbalah: New Perspectives challenged Scholem’s framework, recovering an “ecstatic” Kabbalah of experience alongside the theosophical, and stressing continuity with earlier Jewish tradition.',
    claims: [
      {
        text: 'Idel’s Kabbalah: New Perspectives (1988) revised Scholem by foregrounding ecstatic-experiential Kabbalah and older mystical continuities.',
        evidence: 'documented',
        sources: ['idel-1988'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'kabbalah-new-perspectives' },
      { kind: 'critiqued', target: 'gershom-scholem' },
    ],
    tags: ['jerusalem', 'ecstatic kabbalah', 'revision'],
  },
  {
    id: 'kabbalah-new-perspectives',
    type: 'work',
    name: 'Kabbalah: New Perspectives',
    epithet: 'The book that argued with Scholem’s ghost',
    dates: '1988',
    year: 1988,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Idel’s programmatic revision of Kabbalah studies: phenomenology over pure philology, experience over doctrine, and deep roots in earlier rabbinic mysticism.',
    claims: [
      {
        text: 'The book proposes a phenomenological method and recovers the ecstatic and experiential dimensions Scholem had subordinated.',
        evidence: 'documented',
        sources: ['idel-1988'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'moshe-idel' },
      { kind: 'studied', target: 'kabbalah' },
    ],
    tags: ['1988', 'phenomenology', 'method'],
  },
  {
    id: 'elliot-wolfson',
    type: 'person',
    name: 'Elliot R. Wolfson',
    epithet: 'The reader of vision in the mystical text',
    dates: 'b. 1956',
    year: 1994,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The American scholar-poet of Kabbalah whose Through a Speculum That Shines brought the study of Jewish mysticism into dialogue with philosophy, gender, and the phenomenology of vision.',
    claims: [
      {
        text: 'Wolfson’s Through a Speculum That Shines (1994) analyzed visionary experience and its gendered symbolism in medieval Jewish mysticism.',
        evidence: 'documented',
        sources: ['wolfson-1994'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'kabbalah' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['vision', 'gender', 'philosophy'],
  },
  {
    id: 'joseph-dan',
    type: 'person',
    name: 'Joseph Dan',
    epithet: 'The historian of the Ashkenazi esoteric world',
    dates: '1935–2022',
    year: 2006,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Scholem’s successor at the Hebrew University, historian of the Hasidei Ashkenaz and of the whole sweep of Kabbalah, and lucid guide to the field for wider readers.',
    claims: [
      {
        text: 'Dan wrote extensively on medieval Jewish esotericism and provided accessible syntheses such as Kabbalah: A Very Short Introduction (2006).',
        evidence: 'documented',
        sources: ['dan-2006'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'kabbalah' },
      { kind: 'associated-with', target: 'gershom-scholem' },
    ],
    tags: ['hebrew university', 'ashkenaz', 'synthesis'],
  },
  {
    id: 'carl-jung',
    type: 'person',
    name: 'C. G. Jung',
    epithet: 'The psychologist who read alchemy as the soul’s drama',
    dates: '1875–1961',
    year: 1944,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Swiss psychiatrist who reinterpreted alchemy and Gnosticism as projections of the individuation process — enormously influential, and firmly contested by later historians of science.',
    claims: [
      {
        text: 'Jung’s Psychology and Alchemy (1944) read alchemical imagery as symbolism of psychic transformation, the individuation of the self.',
        evidence: 'primary',
        sources: ['jung-1944'],
      },
      {
        text: 'Historians of alchemy such as Principe and Newman reject the psychological reading as anachronistic, while acknowledging its cultural impact.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'psychology-and-alchemy' },
      { kind: 'critiqued', target: 'alchemy', note: 'reinterpreted it psychologically' },
    ],
    tags: ['individuation', 'psychology', 'zurich'],
  },
  {
    id: 'psychology-and-alchemy',
    type: 'work',
    name: 'Psychology and Alchemy',
    epithet: 'The great work read as the work of the self',
    dates: '1944',
    year: 1944,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Jung’s influential study interpreting alchemical symbolism as a mirror of unconscious individuation — the fountainhead of the psychological reading historians now resist.',
    claims: [
      {
        text: 'The book maps alchemical stages and images onto the process of psychic individuation.',
        evidence: 'primary',
        sources: ['jung-1944'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'carl-jung' },
      { kind: 'associated-with', target: 'eranos' },
    ],
    tags: ['1944', 'individuation', 'symbolism'],
  },
  {
    id: 'mircea-eliade',
    type: 'person',
    name: 'Mircea Eliade',
    epithet: 'The historian of religions who sought the sacred',
    dates: '1907–1986',
    year: 1956,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Romanian-born historian of religions at Chicago whose studies of alchemy, shamanism, and the sacred shaped the field — and whose “religionist” method later scholars sharply criticized.',
    claims: [
      {
        text: 'Eliade’s The Forge and the Crucible (1956) read alchemy within a comparative history of humanity’s relations to matter and time.',
        evidence: 'primary',
        sources: ['eliade-1956'],
      },
      {
        text: 'Hanegraaff situates Eliade within a “religionist” current whose search for a universal sacred is methodologically criticized by the newer field.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'eranos' },
      { kind: 'critiqued', target: 'western-esotericism-field', note: 'his religionism became a foil for the field' },
    ],
    tags: ['chicago', 'sacred', 'religionism'],
  },
  {
    id: 'henry-corbin',
    type: 'person',
    name: 'Henry Corbin',
    epithet: 'The philosopher of the imaginal world',
    dates: '1903–1978',
    year: 1958,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The French scholar of Islamic mysticism who coined the “imaginal” (mundus imaginalis) for a real world of images between sense and intellect — a concept adopted across esoteric studies.',
    claims: [
      {
        text: 'Corbin’s work on Ibn ʿArabī and Persian theosophy developed the mundus imaginalis, a cognitively real intermediate world of images.',
        evidence: 'primary',
        sources: ['corbin-1958'],
      },
      {
        text: 'His concept of the imaginal deeply influenced Faivre’s definition of esotericism through imagination and mediations.',
        evidence: 'scholarship',
        sources: ['faivre-1994', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'eranos' },
      { kind: 'influenced', target: 'antoine-faivre' },
    ],
    tags: ['imaginal', 'sufism', 'iran'],
  },
  {
    id: 'eranos',
    type: 'organization',
    name: 'The Eranos Meetings',
    epithet: 'The lakeside conferences of soul and symbol',
    dates: 'from 1933',
    year: 1933,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The annual gatherings at Ascona on Lake Maggiore where Jung, Eliade, Corbin, Scholem, and others forged a comparative study of symbol and the sacred — inspiring and controversial in equal measure.',
    claims: [
      {
        text: 'From 1933 the Eranos conferences at Ascona convened scholars of religion, myth, and psychology; their proceedings shaped twentieth-century study of symbolism.',
        evidence: 'documented',
        sources: ['hakl-2013'],
      },
      {
        text: 'Hanegraaff analyzes Eranos as a crucible of the “religionist” approach the academic field later distanced itself from.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'carl-jung' },
      { kind: 'associated-with', target: 'henry-corbin' },
      { kind: 'associated-with', target: 'gershom-scholem' },
    ],
    tags: ['ascona', 'symbolism', 'conferences'],
  },
  {
    id: 'lawrence-principe',
    type: 'person',
    name: 'Lawrence M. Principe',
    epithet: 'The chemist-historian who lit the furnace again',
    dates: 'b. 1962',
    year: 2013,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Historian of science and trained chemist at Johns Hopkins who, by decoding and replicating alchemical recipes in the laboratory, restored alchemy to the history of real experimental practice.',
    claims: [
      {
        text: 'Principe reconstructed alchemical experiments from decoded Decknamen, showing many recipes to be replicable; The Secrets of Alchemy (2013) synthesizes the field.',
        evidence: 'documented',
        sources: ['principe-2013', 'newman-principe-2002'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'secrets-of-alchemy' },
      { kind: 'collaborated-with', target: 'william-newman' },
      { kind: 'studied', target: 'alchemy' },
    ],
    tags: ['johns hopkins', 'replication', 'chymistry'],
  },
  {
    id: 'secrets-of-alchemy',
    type: 'work',
    name: 'The Secrets of Alchemy',
    epithet: 'Alchemy restored to the laboratory bench',
    dates: '2013',
    year: 2013,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Principe’s authoritative history: from Greco-Egyptian craft to modern reappraisal, arguing for the continuity of alchemy and chemistry and against the purely psychological reading.',
    claims: [
      {
        text: 'The book surveys the history of alchemy and demonstrates the recovery of workable procedures from allegorical texts.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'lawrence-principe' },
      { kind: 'critiqued', target: 'carl-jung', note: 'against the psychological reading' },
    ],
    tags: ['2013', 'synthesis', 'chymistry'],
  },
  {
    id: 'william-newman',
    type: 'person',
    name: 'William R. Newman',
    epithet: 'The historian who found the author behind Geber',
    dates: 'b. 1955',
    year: 2002,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Historian of science at Indiana University who identified pseudo-Geber, reconstructed Starkey’s chymistry, and edited Newton’s alchemical papers — a leader of alchemy’s scholarly rehabilitation.',
    claims: [
      {
        text: 'Newman identified the author of the Summa perfectionis and, with Principe, reconstructed the laboratory chymistry of Starkey and Boyle.',
        evidence: 'documented',
        sources: ['newman-principe-2002', 'principe-2013'],
      },
    ],
    relations: [
      { kind: 'collaborated-with', target: 'lawrence-principe' },
      { kind: 'studied', target: 'pseudo-geber' },
    ],
    tags: ['indiana', 'chymistry', 'newton project'],
  },
  {
    id: 'betty-jo-dobbs',
    type: 'person',
    name: 'Betty Jo Teeter Dobbs',
    epithet: 'The scholar who took Newton’s alchemy seriously',
    dates: '1930–1994',
    year: 1975,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The historian whose Foundations of Newton’s Alchemy proved that the greatest of natural philosophers pursued the great work in earnest — forcing a rewrite of how the Scientific Revolution is told.',
    claims: [
      {
        text: 'Dobbs’ The Foundations of Newton’s Alchemy (1975) established the seriousness and extent of Newton’s alchemical work.',
        evidence: 'documented',
        sources: ['dobbs-1975'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'isaac-newton' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['newton', 'green lion', 'revision'],
  },
  {
    id: 'brian-copenhaver',
    type: 'person',
    name: 'Brian P. Copenhaver',
    epithet: 'The translator who set the Hermetica straight',
    dates: 'b. 1942',
    year: 1992,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The intellectual historian whose critical translation of the Hermetica became the standard English text, and whose Magic in Western Culture reframed magic as serious philosophy.',
    claims: [
      {
        text: 'Copenhaver’s Hermetica (1992) is the standard critical English translation; his Magic in Western Culture (2015) treats magic as a coherent intellectual tradition.',
        evidence: 'documented',
        sources: ['copenhaver-1992', 'copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'translated', target: 'corpus-hermeticum' },
      { kind: 'studied', target: 'natural-magic' },
    ],
    tags: ['translation', 'hermetica', 'ucla'],
  },
  {
    id: 'garth-fowden',
    type: 'person',
    name: 'Garth Fowden',
    epithet: 'The historian of the Egyptian Hermes',
    dates: 'b. 1953',
    year: 1986,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The historian of late antiquity whose Egyptian Hermes situated the Hermetica within the religious world of Roman Egypt, uniting the philosophical and technical texts in one milieu.',
    claims: [
      {
        text: 'Fowden’s The Egyptian Hermes (1986) reconstructs the social and religious setting of the Hermetica in Greco-Roman Egypt.',
        evidence: 'documented',
        sources: ['fowden-1986'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'hermeticism' },
      { kind: 'studied', target: 'technical-hermetica' },
    ],
    tags: ['late antiquity', 'egypt', 'hermes'],
  },
  {
    id: 'richard-kieckhefer',
    type: 'person',
    name: 'Richard Kieckhefer',
    epithet: 'The historian of the necromancer’s handbook',
    dates: 'b. 1946',
    year: 1989,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The historian at Northwestern whose Magic in the Middle Ages mapped the medieval world of common and learned magic, and who studied the clerical underworld of necromantic manuals.',
    claims: [
      {
        text: 'Kieckhefer’s Magic in the Middle Ages (1989) distinguished natural from demonic magic and illuminated the clerical necromancy of manuals like the Munich handbook.',
        evidence: 'documented',
        sources: ['kieckhefer-1989'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'natural-magic' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['medieval', 'necromancy', 'northwestern'],
  },
  {
    id: 'keith-thomas',
    type: 'person',
    name: 'Keith Thomas',
    epithet: 'The historian who weighed magic against religion',
    dates: 'b. 1933',
    year: 1971,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Oxford social historian whose Religion and the Decline of Magic set popular magic, witchcraft, and astrology within the everyday life of early modern England — a landmark of the social history of belief.',
    claims: [
      {
        text: 'Thomas’ Religion and the Decline of Magic (1971) analyzed the social functions of magical belief and its recession in early modern England.',
        evidence: 'documented',
        sources: ['thomas-1971'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'natural-magic' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['oxford', 'social history', 'england'],
  },
  {
    id: 'ronald-hutton',
    type: 'person',
    name: 'Ronald Hutton',
    epithet: 'The historian who dated modern witchcraft',
    dates: 'b. 1953',
    year: 1999,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Bristol historian whose Triumph of the Moon gave modern Pagan witchcraft its rigorous history, showing Wicca to be a genuine twentieth-century creation from older materials.',
    claims: [
      {
        text: 'Hutton’s The Triumph of the Moon (1999) established the modern origins of Pagan witchcraft and refuted the surviving-cult thesis.',
        evidence: 'documented',
        sources: ['hutton-1999'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'wicca' },
      { kind: 'critiqued', target: 'margaret-murray' },
    ],
    tags: ['bristol', 'paganism', 'witchcraft'],
  },
  {
    id: 'alex-owen',
    type: 'person',
    name: 'Alex Owen',
    epithet: 'The historian of enchantment and the modern self',
    dates: 'contemporary',
    year: 2004,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The historian whose Place of Enchantment read fin-de-siècle occultism as part of the making of modern subjectivity, taking magicians’ inner lives seriously as history.',
    claims: [
      {
        text: 'Owen’s The Place of Enchantment (2004) argues that British occultism was integral to modern ideas of the self and consciousness.',
        evidence: 'documented',
        sources: ['owen-2004'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'golden-dawn' },
      { kind: 'studied', target: 'occult-revival-movement' },
    ],
    tags: ['modernity', 'subjectivity', 'gender'],
  },
  {
    id: 'margaret-jacob',
    type: 'person',
    name: 'Margaret C. Jacob',
    epithet: 'The historian of the enlightened lodge',
    dates: 'b. 1943',
    year: 1991,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The historian who set freemasonry within the political culture of the Enlightenment, showing the lodges as schools of civil society and constitutional sociability.',
    claims: [
      {
        text: 'Jacob’s Living the Enlightenment (1991) analyzed masonic lodges as laboratories of Enlightenment political culture.',
        evidence: 'documented',
        sources: ['jacob-1991'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'freemasonry' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['enlightenment', 'sociability', 'ucla'],
  },
  {
    id: 'ellic-howe',
    type: 'person',
    name: 'Ellic Howe',
    epithet: 'The documentary historian of the Golden Dawn',
    dates: '1910–1991',
    year: 1972,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The printing historian whose Magicians of the Golden Dawn used the order’s own papers to expose the forged Anna Sprengel letters and reconstruct its real, documentary history.',
    claims: [
      {
        text: 'Howe’s The Magicians of the Golden Dawn (1972) is a documentary history exposing the fabricated origins of the order’s foundation story.',
        evidence: 'documented',
        sources: ['howe-1972'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'golden-dawn' },
      { kind: 'critiqued', target: 'cipher-manuscripts', note: 'exposed the forged Sprengel link' },
    ],
    tags: ['documentary history', 'documents', 'forgery'],
  },
  {
    id: 'joscelyn-godwin',
    type: 'person',
    name: 'Joscelyn Godwin',
    epithet: 'The scholar-musician of the theosophical century',
    dates: 'b. 1945',
    year: 1994,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Colgate musicologist and historian whose Theosophical Enlightenment charted the nineteenth-century occult revival, and who has translated and studied a vast esoteric corpus.',
    claims: [
      {
        text: 'Godwin’s The Theosophical Enlightenment (1994) traced the intellectual roots of the modern occult revival from the Enlightenment onward.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'theosophical-society' },
      { kind: 'studied', target: 'occult-revival-movement' },
    ],
    tags: ['colgate', 'music', 'revival'],
  },
  {
    id: 'nicholas-goodrick-clarke',
    type: 'person',
    name: 'Nicholas Goodrick-Clarke',
    epithet: 'The founder of the Exeter centre for esotericism',
    dates: '1953–2012',
    year: 2008,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The historian who established the Exeter Centre for the Study of Esotericism, wrote the standard introduction to the Western esoteric traditions, and studied the darker links of occultism and politics.',
    claims: [
      {
        text: 'Goodrick-Clarke founded the EXESESO centre at Exeter and wrote The Western Esoteric Traditions (2008), a standard survey.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'western-esoteric-traditions-book' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['exeter', 'survey', 'institution'],
  },
  {
    id: 'western-esoteric-traditions-book',
    type: 'work',
    name: 'The Western Esoteric Traditions',
    epithet: 'A historical introduction to the whole current',
    dates: '2008',
    year: 2008,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Goodrick-Clarke’s clear survey from late antiquity to the present — one of the field’s standard classroom introductions to its interwoven traditions.',
    claims: [
      {
        text: 'The book introduces the major Western esoteric currents from Gnosticism and Hermetism to modern occultism.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'nicholas-goodrick-clarke' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['2008', 'introduction', 'survey'],
  },
  {
    id: 'kocku-von-stuckrad',
    type: 'person',
    name: 'Kocku von Stuckrad',
    epithet: 'The theorist of esoteric discourse',
    dates: 'b. 1966',
    year: 2005,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Groningen scholar of religion who reframed esotericism as a discourse of claims to higher knowledge, widening the field beyond a fixed set of “traditions”.',
    claims: [
      {
        text: 'Stuckrad’s Western Esotericism (2005) proposed a discursive approach centered on claims to absolute knowledge and secrecy.',
        evidence: 'documented',
        sources: ['stuckrad-2005'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'western-esotericism-field' },
      { kind: 'critiqued', target: 'antoine-faivre', note: 'proposed a discursive alternative to the four-characteristics model' },
    ],
    tags: ['groningen', 'discourse', 'theory'],
  },
  {
    id: 'egil-asprem',
    type: 'person',
    name: 'Egil Asprem',
    epithet: 'The scholar who questioned the disenchanted world',
    dates: 'b. 1984',
    year: 2014,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Stockholm historian and theorist whose Problem of Disenchantment showed that modern science and esotericism entangled rather than parted, reshaping how the field frames “modernity”.',
    claims: [
      {
        text: 'Asprem’s The Problem of Disenchantment (2014) argues that disenchantment was a contested project, not an accomplished fact, in early twentieth-century thought.',
        evidence: 'documented',
        sources: ['asprem-2014'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'western-esotericism-field' },
      { kind: 'studied', target: 'disenchantment' },
    ],
    tags: ['stockholm', 'disenchantment', 'theory'],
  },
  {
    id: 'christopher-partridge',
    type: 'person',
    name: 'Christopher Partridge',
    epithet: 'The scholar of occulture in the modern world',
    dates: 'contemporary',
    year: 2004,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Lancaster scholar of religion who coined “occulture” for the reservoir of esoteric and paranormal ideas circulating through popular culture and new spiritualities.',
    claims: [
      {
        text: 'Partridge’s The Re-Enchantment of the West (2004–05) introduced “occulture” to describe the diffusion of esoteric ideas through popular culture.',
        evidence: 'documented',
        sources: ['partridge-2004'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'western-esotericism-field' },
      { kind: 'studied', target: 'occult-revival-movement' },
    ],
    tags: ['occulture', 'popular culture', 'lancaster'],
  },
  {
    id: 'owen-davies',
    type: 'person',
    name: 'Owen Davies',
    epithet: 'The historian of the book of spells',
    dates: 'b. 1969',
    year: 2009,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Hertfordshire historian of popular magic whose Grimoires traced the long career of magic books from ancient scrolls to internet PDFs — the social life of the spellbook.',
    claims: [
      {
        text: 'Davies’ Grimoires: A History of Magic Books (2009) surveys the transmission and readership of magical books across two millennia.',
        evidence: 'documented',
        sources: ['davies-2009'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'natural-magic' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['grimoires', 'popular magic', 'books'],
  },
  {
    id: 'jan-assmann',
    type: 'person',
    name: 'Jan Assmann',
    epithet: 'The Egyptologist of cultural memory',
    dates: 'b. 1938',
    year: 1997,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The German Egyptologist whose Moses the Egyptian introduced “mnemohistory” — the history not of events but of how they are remembered — a method fruitful for tracing Hermes and the prisca theologia.',
    claims: [
      {
        text: 'Assmann’s Moses the Egyptian (1997) developed mnemohistory, the study of the past as remembered, tracing the “Egypt” of Western imagination.',
        evidence: 'documented',
        sources: ['assmann-1997'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'prisca-theologia' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['egyptology', 'memory', 'method'],
  },
  {
    id: 'mnemohistory',
    type: 'concept',
    name: 'Mnemohistory',
    epithet: 'The past not as it was, but as it is remembered',
    dates: 'coined 1997',
    year: 1997,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Assmann’s method of studying cultural memory — how figures like Hermes, Moses, or the Rosicrucians are continually reimagined — central to how the field now treats its “ancient wisdom”.',
    claims: [
      {
        text: 'Mnemohistory studies the reception and reconstruction of the past rather than its verifiable events, illuminating traditions built on imagined antiquity.',
        evidence: 'scholarship',
        sources: ['assmann-1997', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'jan-assmann' },
      { kind: 'associated-with', target: 'prisca-theologia' },
    ],
    tags: ['memory', 'reception', 'method'],
  },
  {
    id: 'rejected-knowledge',
    type: 'concept',
    name: 'Rejected Knowledge',
    epithet: 'The waste-basket of the Western mind, read as evidence',
    dates: 'Hanegraaff, 2012',
    year: 2012,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Hanegraaff’s reframing of “esotericism” as the body of knowledge cast out by both religious orthodoxy and Enlightenment reason — a category made by exclusion, and thus a mirror of Western identity.',
    claims: [
      {
        text: 'Hanegraaff argues that “Western esotericism” names knowledge polemically rejected by Protestant and Enlightenment thought, then reified into a scholarly object.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'wouter-hanegraaff' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['category', 'polemics', 'identity'],
  },
  {
    id: 'disenchantment',
    type: 'concept',
    name: 'Disenchantment',
    epithet: 'The world drained of magic — or was it?',
    dates: 'Weber 1917; contested since',
    year: 1917,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Max Weber’s thesis that modernity strips the world of magic — a narrative the study of esotericism complicates, since magical and scientific thought have never fully parted.',
    claims: [
      {
        text: 'Weber’s Entzauberung thesis frames modernity as the retreat of magic; Asprem and others show the boundary was contested and porous.',
        evidence: 'scholarship',
        sources: ['asprem-2014', 'hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'egil-asprem' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['weber', 'modernity', 'debate'],
  },
  {
    id: 'religionism',
    type: 'concept',
    name: 'Religionism',
    epithet: 'The search for the sacred, and its critics',
    dates: 'Eranos era; critiqued from 1990s',
    year: 1950,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Eranos-style approach — Jung, Eliade, Corbin — that sought a universal inner sacred behind the traditions, and against which the newer, historical-critical field defined its method.',
    claims: [
      {
        text: 'Hanegraaff labels the Eranos current “religionist” and distinguishes the field’s empirical-historical method from its search for a perennial sacred.',
        evidence: 'scholarship',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'eranos' },
      { kind: 'critiqued', target: 'western-esotericism-field', note: 'the foil against which the field defined itself' },
    ],
    tags: ['eranos', 'method', 'debate'],
  },
  {
    id: 'yates-thesis',
    type: 'concept',
    name: 'The Yates Thesis',
    epithet: 'Did Hermes help father modern science?',
    dates: '1964, debated since',
    year: 1964,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The influential and much-qualified claim that Renaissance Hermeticism, with its will to operate on nature, helped prepare the ground for the Scientific Revolution.',
    claims: [
      {
        text: 'Yates argued that the Hermetic impulse to command nature contributed to the emergence of modern science; later scholars broke the single “tradition” into plural currents and narrowed the claim.',
        evidence: 'scholarship',
        sources: ['yates-1964', 'hanegraaff-2012', 'copenhaver-2015'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'frances-yates' },
      { kind: 'associated-with', target: 'renaissance-magic' },
    ],
    tags: ['debate', 'scientific revolution', 'historiography'],
  },
  {
    id: 'art-of-memory-book',
    type: 'work',
    name: 'The Art of Memory',
    epithet: 'Yates traces the palaces of the mind through history',
    dates: '1966',
    year: 1966,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Yates’s classic history of the mnemonic art from antiquity through Bruno and Fludd — showing how a technique of rhetoric became, in the magi’s hands, a Hermetic discipline.',
    claims: [
      {
        text: 'The Art of Memory (1966) follows the memory tradition from classical rhetoric to its Renaissance transformation into occult method.',
        evidence: 'documented',
        sources: ['yates-1966'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'frances-yates' },
      { kind: 'studied', target: 'art-of-memory' },
    ],
    tags: ['1966', 'memory', 'history'],
  },
  {
    id: 'occult-philosophy-elizabethan',
    type: 'work',
    name: 'The Occult Philosophy in the Elizabethan Age',
    epithet: 'Yates finds Agrippa’s three worlds in Shakespeare’s England',
    dates: '1979',
    year: 1979,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'Yates’s late study tracing the Christian-Cabalist occult philosophy of Agrippa through Dee into Elizabethan poetry and drama — esotericism read in the literature of an age.',
    claims: [
      {
        text: 'The book follows Agrippa’s three-world scheme and its Cabalist framing into the culture of Elizabethan England, including Dee and the poets.',
        evidence: 'documented',
        sources: ['yates-1979'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'frances-yates' },
      { kind: 'studied', target: 'three-books-of-occult-philosophy' },
    ],
    tags: ['1979', 'elizabethan', 'literature'],
  },
  {
    id: 'ritman-library',
    type: 'organization',
    name: 'The Ritman Library (BPH)',
    epithet: 'The house of the living Hermetic book',
    dates: 'Amsterdam, from 1984',
    year: 1984,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The Bibliotheca Philosophica Hermetica in Amsterdam, one of the world’s great collections of Hermetic, alchemical, Rosicrucian, and mystical texts — a research engine for the modern field.',
    claims: [
      {
        text: 'Joost Ritman’s Bibliotheca Philosophica Hermetica, opened in Amsterdam in 1984, holds a major collection of primary esoteric sources and supports scholarship.',
        evidence: 'documented',
        sources: ['hanegraaff-2005'],
      },
    ],
    relations: [
      { kind: 'located-in', target: 'london', note: 'part of the same north-European scholarly world; the library is in Amsterdam' },
      { kind: 'associated-with', target: 'hermeticism' },
    ],
    tags: ['amsterdam', 'library', 'collection'],
  },
  {
    id: 'hhp-amsterdam',
    type: 'organization',
    name: 'The Amsterdam Chair (HHP)',
    epithet: 'The centre for the History of Hermetic Philosophy',
    dates: 'from 1999',
    year: 1999,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The University of Amsterdam’s Center for the History of Hermetic Philosophy and Related Currents — the field’s most prominent research and teaching centre, led first by Hanegraaff.',
    claims: [
      {
        text: 'The HHP centre and chair, established at the University of Amsterdam in 1999, became a leading hub for teaching and research in the field.',
        evidence: 'documented',
        sources: ['hanegraaff-2012'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'wouter-hanegraaff' },
      { kind: 'part-of', target: 'western-esotericism-field' },
    ],
    tags: ['amsterdam', 'chair', '1999'],
  },
  {
    id: 'esswe',
    type: 'organization',
    name: 'ESSWE',
    epithet: 'The learned society of the whole field',
    dates: 'founded 2005',
    year: 2005,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The European Society for the Study of Western Esotericism, whose conferences and networks knit together the scholars, chairs, and journals of a discipline that came of age in the new century.',
    claims: [
      {
        text: 'ESSWE, founded in 2005, is the field’s principal learned society, complementing journals such as Aries and the Amsterdam and Exeter centres.',
        evidence: 'documented',
        sources: ['hanegraaff-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'western-esotericism-field' },
      { kind: 'associated-with', target: 'hhp-amsterdam' },
    ],
    tags: ['society', '2005', 'europe'],
  },
  {
    id: 'michael-dummett',
    type: 'person',
    name: 'Michael Dummett',
    epithet: 'The philosopher who debunked the ancient tarot',
    dates: '1925–2011',
    year: 1996,
    era: 'twentieth',
    cluster: 'scholarship',
    summary:
      'The eminent Oxford philosopher and tarot historian who proved the cards began as a fifteenth-century Italian game, and that their occult meanings were an eighteenth-century invention.',
    claims: [
      {
        text: 'Dummett’s work, including A Wicked Pack of Cards (1996), showed the tarot originated as a card game and acquired occult significance only from Court de Gébelin onward.',
        evidence: 'documented',
        sources: ['dummett-1996'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'tarot' },
      { kind: 'critiqued', target: 'tarot', note: 'debunked its claimed ancient Egyptian origin' },
    ],
    tags: ['oxford', 'tarot history', 'game'],
  },
];
