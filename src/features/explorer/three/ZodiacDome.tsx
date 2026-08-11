import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ZODIAC } from '../../../data/astrology';
import { OCULUS_R, ROT_R, ROT_WALL_H, ROT_DOME_TOP } from './layout';

/**
 * The heavens, charted. A translucent star-map wheels slowly across the
 * inside of the timber dome — the twelve zodiac constellations picked out in
 * glowing stars and hairline gold, each sign's glyph beneath its figure.
 *
 * The signs stay up on the dome where they belong. A ring of them used to turn
 * at eye level too, but the great globe holds that air now and it is left
 * clear.
 */

/* ————— approximate constellation figures, one per sign ————— *
 * coordinates are within a unit box (x across the sector, y up the dome);   *
 * lines join star indices. Artistic sky-atlas licence, not an ephemeris.    */
/**
 * The twelve zodiac figures, as star positions and the lines that join them.
 * Coordinates are normalised inside each sign's own sector: x and y both run
 * 0→1 across the patch the sign occupies, and the third number on a star is
 * its drawn magnitude. Exported because the celestial globe by the Librarian
 * draws the same constellations onto a sphere (see globeTexture).
 */
export const FIGURES: { stars: [number, number, number][]; lines: [number, number][] }[] = [
  // Aries — a bent horn
  { stars: [[0.2, 0.35, 2], [0.42, 0.52, 3], [0.66, 0.6, 2.4], [0.8, 0.5, 1.8]], lines: [[0, 1], [1, 2], [2, 3]] },
  // Taurus — the V of the Hyades with long horns
  { stars: [[0.5, 0.42, 3], [0.38, 0.52, 2], [0.62, 0.52, 2], [0.22, 0.72, 2.6], [0.82, 0.74, 2.2], [0.44, 0.3, 1.6]], lines: [[5, 0], [0, 1], [0, 2], [1, 3], [2, 4]] },
  // Gemini — the twin stems
  { stars: [[0.32, 0.75, 2.8], [0.52, 0.78, 2.8], [0.3, 0.5, 1.8], [0.52, 0.52, 1.8], [0.28, 0.28, 2.2], [0.54, 0.3, 2.2]], lines: [[0, 2], [2, 4], [1, 3], [3, 5], [0, 1]] },
  // Cancer — the faint Y
  { stars: [[0.46, 0.66, 1.8], [0.46, 0.5, 2], [0.3, 0.34, 1.8], [0.64, 0.36, 1.8], [0.6, 0.78, 1.5]], lines: [[4, 0], [0, 1], [1, 2], [1, 3]] },
  // Leo — the sickle and the haunch
  { stars: [[0.24, 0.36, 3], [0.3, 0.52, 2], [0.4, 0.62, 2.2], [0.52, 0.6, 1.8], [0.56, 0.44, 1.6], [0.78, 0.4, 2.6], [0.72, 0.58, 1.8]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [3, 6], [6, 5], [5, 4]] },
  // Virgo — the reclining sprawl with Spica bright
  { stars: [[0.2, 0.6, 1.8], [0.36, 0.64, 2], [0.5, 0.54, 2.2], [0.64, 0.6, 1.6], [0.56, 0.36, 3], [0.8, 0.44, 1.6]], lines: [[0, 1], [1, 2], [2, 3], [3, 5], [2, 4]] },
  // Libra — the beam and pans
  { stars: [[0.36, 0.66, 2.4], [0.62, 0.68, 2.4], [0.49, 0.5, 2], [0.34, 0.32, 1.8], [0.66, 0.3, 1.8]], lines: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4]] },
  // Scorpio — the hook with Antares burning
  { stars: [[0.24, 0.72, 2], [0.34, 0.64, 2.2], [0.42, 0.54, 3.2], [0.46, 0.4, 2], [0.54, 0.28, 2], [0.66, 0.24, 2.2], [0.78, 0.32, 2.4]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
  // Sagittarius — the drawn bow
  { stars: [[0.3, 0.3, 2], [0.42, 0.44, 2.4], [0.54, 0.58, 2.4], [0.66, 0.7, 2], [0.62, 0.34, 2.2], [0.36, 0.66, 2]], lines: [[0, 1], [1, 2], [2, 3], [1, 4], [2, 5]] },
  // Capricorn — the sea-goat's smile
  { stars: [[0.2, 0.6, 2.2], [0.38, 0.42, 2], [0.56, 0.34, 2], [0.74, 0.44, 2.2], [0.82, 0.62, 2.4]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  // Aquarius — the falling water zigzag
  { stars: [[0.3, 0.72, 2.2], [0.44, 0.62, 2], [0.38, 0.48, 1.8], [0.54, 0.4, 2], [0.48, 0.26, 1.8], [0.68, 0.6, 2.2]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5]] },
  // Pisces — the two fish on their cord
  { stars: [[0.22, 0.32, 2], [0.34, 0.44, 1.8], [0.48, 0.54, 2], [0.62, 0.64, 1.8], [0.76, 0.72, 2.2], [0.8, 0.56, 1.8]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 3]] },
];

let domeTexCache: THREE.CanvasTexture | null = null;
function domeTex(): THREE.CanvasTexture {
  if (domeTexCache) return domeTexCache;
  const W = 4096;
  const H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  // transparent ground — the timber dome stays visible behind the chart
  x.clearRect(0, 0, W, H);

  const sector = W / 12;
  const star = (px: number, py: number, r: number, bright = false) => {
    const g = x.createRadialGradient(px, py, 0, px, py, r * 4);
    g.addColorStop(0, bright ? 'rgba(255,240,205,0.95)' : 'rgba(255,232,180,0.85)');
    g.addColorStop(0.35, 'rgba(255,220,150,0.32)');
    g.addColorStop(1, 'rgba(255,210,130,0)');
    x.fillStyle = g;
    x.beginPath();
    x.arc(px, py, r * 4, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#fff4da';
    x.beginPath();
    x.arc(px, py, r, 0, Math.PI * 2);
    x.fill();
  };

  for (let i = 0; i < 12; i++) {
    const x0 = i * sector;
    const fig = FIGURES[i];
    // the figure occupies the middle band of the sector; canvas y=0 is the
    // dome's crown, so "up the dome" means smaller y
    const pts = fig.stars.map(([fx, fy, r]) => [x0 + sector * (0.14 + fx * 0.72), H * (0.86 - fy * 0.58), r] as const);
    // hairline gold joins
    x.strokeStyle = 'rgba(201,166,72,0.52)';
    x.lineWidth = 3;
    for (const [a, b] of fig.lines) {
      x.beginPath();
      x.moveTo(pts[a][0], pts[a][1]);
      x.lineTo(pts[b][0], pts[b][1]);
      x.stroke();
    }
    for (const [px, py, r] of pts) star(px, py, r * 2.8, r >= 2.8);
    // the sign's glyph on the lower rim, upright for a viewer beneath
    x.save();
    x.translate(x0 + sector / 2, H * 0.88);
    x.fillStyle = 'rgba(238,206,124,0.95)';
    x.shadowColor = 'rgba(255,214,138,0.95)';
    x.shadowBlur = 30;
    x.font = '150px "Segoe UI Symbol", "Arial Unicode MS", serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(ZODIAC[i].glyph, 0, 0);
    x.restore();
    // faint sector ray
    x.strokeStyle = 'rgba(201,166,72,0.12)';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(x0, H * 0.98);
    x.lineTo(x0, H * 0.12);
    x.stroke();
  }
  // the ecliptic band along the glyph rim
  x.strokeStyle = 'rgba(201,166,72,0.28)';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(0, H * 0.8);
  x.lineTo(W, H * 0.8);
  x.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  domeTexCache = t;
  return t;
}

/** the glowing chart, wheeling slowly inside the timber cone */
export function ZodiacDome({ still }: { still: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const baseY = ROT_WALL_H + 0.1;
    const topY = ROT_DOME_TOP - 0.6;
    const h = topY - baseY;
    const g = new THREE.CylinderGeometry(OCULUS_R + 0.5, ROT_R - 0.4, h, 72, 1, true);
    g.translate(0, baseY + h / 2, 0);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: domeTex(),
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        // Held well down, and `fog: false` removed with it.
        //
        // This chart was rendering at full strength and unfogged, which made
        // the glyphs and constellation lines the brightest thing in the
        // building after the moonshaft — so the eye went to floating symbols
        // instead of to the dome carrying them. Magic in this room is supposed
        // to be the LAST thing a visitor notices, not the first.
        //
        // Letting the fog reach it also means the far side of the dome now
        // recedes like everything else, instead of hanging at full brightness
        // forty metres away.
        opacity: 0.44,
        toneMapped: true,
      }),
    [],
  );
  useEffect(
    () => () => {
      geom.dispose();
      mat.dispose();
    },
    [geom, mat],
  );
  useFrame((_, delta) => {
    if (still || !mesh.current) return;
    mesh.current.rotation.y += delta * 0.008; // the slow wheel of the year
  });
  return <mesh ref={mesh} geometry={geom} material={mat} />;
}
