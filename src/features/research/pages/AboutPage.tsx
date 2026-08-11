import { EVIDENCE_META, type EvidenceLevel } from '../../../domain/types';
import { EvidenceBadge } from '../../shared/bits';

const LEVELS = Object.keys(EVIDENCE_META) as EvidenceLevel[];

export function AboutPage() {
  return (
    <>
      <h1 className="page-title">Methodology</h1>
      <p className="research-lede">
        Asterion is a digital humanities project about the documented history of Western esoteric
        traditions — their people, books, symbols, organizations, and ideas. It neither practices
        nor debunks; it documents, following the methods of the academic study of Western
        esotericism.
      </p>

      <h2 className="section-title">The evidence rubric</h2>
      <p>
        Every statement in the collection is a <em>claim</em> with an explicit evidence level and
        one or more citations into the bibliography. The levels:
      </p>
      <ul className="claim-list">
        {LEVELS.map((l) => (
          <li key={l} className="claim-item">
            <EvidenceBadge level={l} />
            <p className="claim-text">{EVIDENCE_META[l].blurb}</p>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '1rem' }}>
        The distinction matters most where the record is contested. The founding of the Grand Lodge
        in 1717 rests on a retrospective account; the Zohar has both a traditional attribution and
        a scholarly one; the Golden Dawn’s charter correspondence is judged a fabrication by its
        principal documentary historian. In each case the museum shows the layers rather than
        flattening them.
      </p>

      <h2 className="section-title">The Archivist</h2>
      <p>
        The research companion retrieves from the indexed collection and from nothing else. Every
        passage it offers is a claim from the dataset, quoted with its evidence level and
        citations, so it cannot invent references. When the collection has no good answer, it says
        so plainly. Its confidence indicator reflects match quality, not rhetorical certainty.
      </p>

      <h2 className="section-title">Accessibility</h2>
      <p>
        Everything in the museum is available without the immersive mode: research mode carries the
        identical collection in semantic HTML, navigable by keyboard and screen reader. The header
        offers reduced motion (“Calm”), high contrast, and optional sound; the immersive scenes
        also honour the operating system’s reduced-motion preference automatically. Text scales
        with your browser’s settings.
      </p>

      <h2 className="section-title">Scope & limitations</h2>
      <p>
        This collection is a curated beginning, not an encyclopedia of everything esoteric. Entries
        favour depth of citation over breadth of coverage, and the bibliography leans on standard
        academic works. Corrections and extensions are part of the design: the data model treats
        relationships and citations as first-class, so the collection can grow without loosening
        its standards.
      </p>
    </>
  );
}
