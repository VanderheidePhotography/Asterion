import type { ClusterId } from '../domain/types';

/**
 * Orientation copy for a wing's threshold plaque — the two or three sentences
 * a visitor who has never heard of Rosicrucianism, say, gets before the
 * shelves ask anything more of them. Same register as `plateLore.ts`: plain,
 * historically careful, no practice and no debunking, just enough to walk in
 * knowing what they are about to walk through.
 */
export const WING_LORE: Record<ClusterId, string> = {
  hermetica:
    'The writings attributed to Hermes Trismegistus — a legendary sage fused from Greek Hermes and Egyptian Thoth — and the late antique world that produced them. Renaissance Europe read the Corpus Hermeticum as prophecy older than Moses; modern scholarship reads it as the philosophical Greek of Roman Egypt, its author or authors otherwise unknown.',
  alchemy:
    'The art of transmutation, pursued across two languages of the same work: a laboratory practice of furnaces, alembics, and recorded failures, and a spiritual allegory in which the base matter refined is the practitioner. The gold sought was sometimes literal and sometimes not, often both at once in the same treatise.',
  kabbalah:
    'Jewish mysticism\'s account of how an unknowable God is present in creation, mapped through the ten sefirot and the letters of the Hebrew alphabet. Its central texts — the Sefer Yetzirah, the Zohar — were later read outside their tradition by Christian scholars who adapted the framework into something its authors would not recognise as their own.',
  renaissance:
    'Magic reborn as natural philosophy: Marsilio Ficino and Pico della Mirandola treating the cosmos as a web of sympathies a learned man could study and, carefully, use. This is the shelf where astrology, Hermetic revival, and the new Christian Kabbalah of the fifteenth century meet as one intellectual project, not three.',
  'early-modern':
    'The Rosicrucian manifestos of the 1610s announced a secret brotherhood that, so far as anyone has found, never existed — and the announcement itself set a continent arguing for a generation. Alongside it stands the harder-edged mysticism of Jacob Boehme and the Christian theosophers who took the manifestos as an invitation rather than a hoax.',
  freemasonry:
    'A stonemasons\' craft guild that became, over the eighteenth century, a fraternal order for gentlemen: lodges, degrees, and a symbolism of the builder\'s tools read as moral allegory. Enlightenment sociability and older, half-remembered ritual sit on the same shelf here, not always easy to tell apart.',
  'occult-revival':
    'The nineteenth century\'s occult reinvention, crowded and quarrelsome: Spiritualism\'s séances, Theosophy\'s claimed Tibetan masters, and the Hermetic Order of the Golden Dawn\'s ceremonial magic, all arriving within a few decades of each other and borrowing freely from everything the earlier wings hold.',
  scholarship:
    'The academic field that studies everything in the other seven wings without practicing any of it — Frances Yates, Antoine Faivre, and the historians and religionists who turned esotericism from a curiosity into a subject with its own journals, chairs, and arguments about its own boundaries.',
};
