import * as THREE from 'three';
import { texPx } from './textureBudget';

/**
 * THE GLORIA — the Tetragrammaton in a burst of glory, and the Eye of
 * Providence in a radiant delta beneath it, at the head of the Librarian's
 * apse where the founder's portrait used to hang.
 *
 * ── the 2026-08-05 remake ──────────────────────────────────────────────────
 *
 * The first pass was drawn on a 1024² canvas with a soft painted cloud bank
 * across its feet, and from the rotunda floor — thirty metres down the hall —
 * it read as a cartoon: a fat rainbow, a fuzzy triangle and an eye with a
 * single dot for a pupil. Two things were wrong. It was too SMALL on the wall
 * (4 m of a 6 m register), and it was too SOFT to survive the distance — every
 * edge was a low-res gradient, so nothing held a line.
 *
 * This version is drawn at 2048² and is built as ENGRAVING, not painting:
 * gilt line-work with a dark keyline under it, the way a period frontispiece
 * plate is cut, so every edge stays crisp when the plane is scaled up on the
 * wall. The two emblems are stacked — the Name up in the sky, the delta and
 * eye below — so each is large in its own right rather than fighting for the
 * same centre. The cloud bank is GONE from the canvas: it is now real geometry
 * in `ApseWall` (a bank of layered puffs with depth), which is the only way a
 * cloud reads as a cloud rather than as a smudge.
 *
 * Painted on a TRANSPARENT canvas, drawn unlit and `toneMapped: false` by its
 * caller, like the fanlight and every flame in the building.
 */
export function gloriaTexture(): THREE.CanvasTexture {
  const W = texPx(2048);
  const H = texPx(2048);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const cx = W / 2;
  // the glory's optical centre — the rays fan from here, the Name sits above
  // it and the delta below it
  const gy = H * 0.5;

  // ——— the aureole the whole thing floats in ———
  const halo = ctx.createRadialGradient(cx, gy, 0, cx, gy, H * 0.52);
  halo.addColorStop(0, 'rgba(255,244,208,0.9)');
  halo.addColorStop(0.28, 'rgba(252,214,132,0.42)');
  halo.addColorStop(0.62, 'rgba(230,178,96,0.12)');
  halo.addColorStop(1, 'rgba(230,178,96,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // ——— the rays: alternating long/short, each a thin gilt wedge with a bright
  //     spine, as an engraved glory is cut ———
  ctx.save();
  ctx.translate(cx, gy);
  const N = 56;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const long = i % 2 === 0;
    const len = H * (long ? 0.5 : 0.31);
    const foot = H * 0.055;
    const tx = Math.cos(a) * len;
    const ty = Math.sin(a) * len;
    const fx = Math.cos(a) * foot;
    const fy = Math.sin(a) * foot;
    const px = -Math.sin(a);
    const py = Math.cos(a);
    const halfW = long ? 11 : 7;
    const g = ctx.createLinearGradient(fx, fy, tx, ty);
    g.addColorStop(0, 'rgba(255,240,196,0.85)');
    g.addColorStop(0.5, 'rgba(255,224,150,0.42)');
    g.addColorStop(1, 'rgba(255,214,130,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(fx + px * halfW, fy + py * halfW);
    ctx.lineTo(tx, ty);
    ctx.lineTo(fx - px * halfW, fy - py * halfW);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // a gilt-ink helper: a dark keyline laid first, the gold stroke over it, so
  // the line reads as incised metal rather than as a glowing wire
  const engrave = (draw: () => void, width: number, gold = '#ffe9b0') => {
    ctx.save();
    ctx.strokeStyle = 'rgba(60,40,14,0.7)';
    ctx.lineWidth = width + 4;
    draw();
    ctx.strokeStyle = gold;
    ctx.lineWidth = width;
    ctx.shadowColor = 'rgba(255,226,150,0.8)';
    ctx.shadowBlur = 22;
    draw();
    ctx.restore();
  };

  // ——— the delta, its double rim, and the eye within ———
  // The delta and eye are the upper focus, sat under the crown of the Royal
  // Arch bow that spans the two pillars in front of the wall; the Name goes
  // BELOW them, in the clear air over the cloud bank, where nothing occludes
  // it — the first pass put the Name up in the glory and the rainbow's crown
  // swallowed it whole.
  /**
   * A TRUE EQUILATERAL DELTA, and the Name inside it.
   *
   * The first cut was neither. Its height was set independently of its width
   * (0.34 H against 0.64 W), which made it a squat isoceles wedge — a shape
   * that reads as a badly drawn triangle rather than as the delta, because the
   * delta is equilateral and the eye knows it even when it cannot say why. The
   * height is now DERIVED: half-width × √3, which is the equilateral height for
   * a base of 2 × half-width, so the figure is correct at any size it is cut.
   *
   * The Eye of Providence that sat inside it is gone, and the Tetragrammaton —
   * which used to float in the clear glory below the delta — has moved into the
   * triangle. That is the older arrangement and the better one: the Name inside
   * the radiant delta is the form the Royal Arch and every 18th-century
   * frontispiece actually uses, and the two devices stop competing for the
   * wall's one focal point.
   */
  const dcx = cx;
  const dHalf = W * 0.29;
  const dHeight = dHalf * Math.sqrt(3);
  const dApex = H * 0.24;
  const dBase = dApex + dHeight;
  const triangle = (inset: number) => {
    // an inset triangle stays equilateral only if every side moves in by the
    // same perpendicular distance: for a triangle that is 2·inset up from the
    // base and inset·2/√3 in from each apex
    const k = inset * 2;
    ctx.beginPath();
    ctx.moveTo(dcx, dApex + k);
    ctx.lineTo(dcx + dHalf - inset * 1.155, dBase - inset);
    ctx.lineTo(dcx - dHalf + inset * 1.155, dBase - inset);
    ctx.closePath();
  };
  // the face, a soft gilt wash so the eye sits on gold rather than on nothing
  ctx.save();
  triangle(0);
  const face = ctx.createLinearGradient(0, dApex, 0, dBase);
  face.addColorStop(0, 'rgba(255,248,224,0.5)');
  face.addColorStop(1, 'rgba(240,206,140,0.28)');
  ctx.fillStyle = face;
  ctx.fill();
  ctx.restore();
  // the outer rim and, inset, a fine inner fillet — the two lines a real
  // engraved delta carries
  engrave(() => triangle(0), 13);
  engrave(() => triangle(34), 5);

  /* The Eye of Providence stood here and is GONE, with its lids, iris, pupil
     and catchlight. What fills the delta now is the Name, which is what the
     delta carries in the Royal Arch and in most of the frontispieces this wall
     is quoting; the eye is the later, and by now the louder, of the two. */

  // ——— the Tetragrammaton, cut large INSIDE the delta ———
  // Canvas lays Hebrew out right-to-left itself, so the string is written in
  // logical order and comes out as יהוה.
  //
  // Sized to the triangle rather than to the canvas: at the height the Name
  // sits, the delta is only so wide, and a fixed font size that fits at one
  // scale runs out through the sloping sides at another. The glyphs are
  // measured and stepped down until they clear the sides with a margin.
  const ny = dApex + dHeight * 0.62;
  /** the delta's half-width at the Name's height, less a margin */
  const room = dHalf * ((ny - dApex) / dHeight) * 2 * 0.78;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let nameSize = Math.round(W * 0.2);
  for (;;) {
    ctx.font = `700 ${nameSize}px "Times New Roman", serif`;
    if (ctx.measureText('יהוה').width <= room || nameSize <= 40) break;
    nameSize -= 4;
  }
  // a sub-aureole behind the letters so the Name is a source in its own right
  // and does not sit flat on the delta's wash
  const nGlow = ctx.createRadialGradient(cx, ny, 0, cx, ny, room * 0.95);
  nGlow.addColorStop(0, 'rgba(255,246,216,0.62)');
  nGlow.addColorStop(0.5, 'rgba(255,220,150,0.2)');
  nGlow.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = nGlow;
  ctx.beginPath();
  ctx.arc(cx, ny, room * 0.95, 0, Math.PI * 2);
  ctx.fill();
  // a broad dark keyline first so the gilt letters read against the glory,
  // then the gilt fill with a warm inner sheen
  ctx.lineJoin = 'round';
  ctx.lineWidth = 16;
  ctx.strokeStyle = 'rgba(52,34,10,0.82)';
  ctx.strokeText('יהוה', cx, ny);
  const nameFill = ctx.createLinearGradient(0, ny - nameSize * 0.6, 0, ny + nameSize * 0.6);
  nameFill.addColorStop(0, '#fff7dd');
  nameFill.addColorStop(0.5, '#f6d488');
  nameFill.addColorStop(1, '#dcac52');
  ctx.fillStyle = nameFill;
  ctx.shadowColor = 'rgba(255,230,155,0.95)';
  ctx.shadowBlur = 46;
  ctx.fillText('יהוה', cx, ny);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
