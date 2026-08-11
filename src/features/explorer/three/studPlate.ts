import * as THREE from 'three';
import { SERIF, engrave } from './plateArt';

/**
 * The little lettered brass tablet that stands on a stud at the rim.
 *
 * Every plate on this instrument ends up needing the same object: a small
 * canted keyplate naming something a visitor can click — a city, a figure, a
 * part of the mechanism, a wonder. They are the plates' index, and having one
 * baker for all of them is what keeps eight charts looking like eight plates of
 * one instrument rather than eight people's textures.
 *
 * The `active` state is the same convention the console uses: not a different
 * colour, the SAME brass with the light on it. Greying an inactive stud would
 * read as disabled — as a thing you may not press — where what is meant is
 * simply that it is not the one currently chosen.
 */

const cache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>();

export function studPlate(
  title: string,
  sub: string,
  active = false,
): { tex: THREE.CanvasTexture; aspect: number } {
  const id = `${title}|${sub}|${active}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const W = 512;
  const H = 200;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;

  /**
   * The tablet is CUT TO SHAPE, not painted onto a rectangle.
   *
   * These are plane meshes with an alpha'd map, so whatever is left transparent
   * is the tablet's silhouette. The first cut filled the canvas corner to
   * corner: ten hard-edged rectangles standing round a chart of circles, every
   * one of them ending in a right angle a real cast tablet would have had the
   * founder round off. Clipping to a rounded rect costs nothing and is most of
   * what separates these from UI.
   */
  const RAD = 22;
  const round = (l: number, t: number, w: number, h: number, r: number) => {
    x.beginPath();
    x.moveTo(l + r, t);
    x.arcTo(l + w, t, l + w, t + h, r);
    x.arcTo(l + w, t + h, l, t + h, r);
    x.arcTo(l, t + h, l, t, r);
    x.arcTo(l, t, l + w, t, r);
    x.closePath();
  };

  x.save();
  round(4, 4, W - 8, H - 8, RAD);
  x.clip();

  const g = x.createLinearGradient(0, 0, 0, H);
  if (active) {
    g.addColorStop(0, '#8a6a2a');
    g.addColorStop(0.32, '#f2d38d');
    g.addColorStop(0.56, '#ffefbe');
    g.addColorStop(1, '#7a5a24');
  } else {
    g.addColorStop(0, '#42341a');
    g.addColorStop(0.36, '#846c38');
    g.addColorStop(0.58, '#8f7440');
    g.addColorStop(1, '#33280f');
  }
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  /* The founder's mark: brass is CAST, and a cast face is never one clean
     sweep of tone. A few soft blooms of light and shade break the gradient up
     so the tablet reads as metal at reading distance instead of as a printed
     swatch, and they are wide and low-contrast enough to stay invisible as
     shapes. Seeded off nothing — the same three blooms on every tablet are
     fine, because no two are ever seen edge to edge. */
  for (const [bx, by, br, tone] of [
    [W * 0.22, H * 0.3, W * 0.3, active ? 'rgba(255,246,214,0.16)' : 'rgba(214,190,140,0.1)'],
    [W * 0.78, H * 0.62, W * 0.34, 'rgba(26,18,6,0.14)'],
    [W * 0.54, H * 0.14, W * 0.26, active ? 'rgba(255,250,230,0.12)' : 'rgba(214,190,140,0.07)'],
  ] as [number, number, number, string][]) {
    const bloom = x.createRadialGradient(bx, by, 0, bx, by, br);
    bloom.addColorStop(0, tone);
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = bloom;
    x.fillRect(0, 0, W, H);
  }

  // the bevel: bright chamfer at the head, dark at the foot, both following
  // the rounded edge rather than cutting across the corners
  x.lineWidth = 6;
  x.strokeStyle = active ? 'rgba(255,240,200,0.6)' : 'rgba(230,205,150,0.22)';
  round(4, 7, W - 8, H - 8, RAD);
  x.stroke();
  x.strokeStyle = 'rgba(20,14,4,0.5)';
  round(4, 1, W - 8, H - 8, RAD);
  x.stroke();
  x.restore();

  // the engraved border rule, inset off the bevel
  x.strokeStyle = active ? '#5a4014' : '#241a0c';
  x.lineWidth = 6;
  round(15, 15, W - 30, H - 30, RAD - 8);
  x.stroke();
  x.strokeStyle = active ? 'rgba(255,246,214,0.5)' : 'rgba(200,176,120,0.3)';
  x.lineWidth = 2;
  round(15, 13, W - 30, H - 30, RAD - 8);
  x.stroke();

  const dark = active ? '#3a2810' : '#20180a';
  const light = active ? '#fff6da' : '#c4a86c';

  // the title shrinks to fit rather than wrapping — a stud with two lines of
  // title and one of gloss reads as a paragraph at a glance, not as a label
  let size = 46;
  x.font = `${size}px ${SERIF}`;
  while (x.measureText(title).width > W - 56 && size > 16) {
    size -= 2;
    x.font = `${size}px ${SERIF}`;
  }
  engrave(x, title, W / 2, H * 0.38, size, { dark, light });

  /* the rule between name and gloss: two short hairlines and a lozenge, which
     is what the plates' own cartouches use. Without it the gloss reads as a
     second line of title that happens to be smaller. */
  x.save();
  x.strokeStyle = light;
  x.fillStyle = light;
  x.globalAlpha = 0.4;
  x.lineWidth = 2;
  const ry = H * 0.55;
  for (const s of [-1, 1]) {
    x.beginPath();
    x.moveTo(W / 2 + s * 26, ry);
    x.lineTo(W / 2 + s * 96, ry);
    x.stroke();
  }
  x.beginPath();
  x.moveTo(W / 2, ry - 7);
  x.lineTo(W / 2 + 9, ry);
  x.lineTo(W / 2, ry + 7);
  x.lineTo(W / 2 - 9, ry);
  x.closePath();
  x.fill();
  x.restore();

  let subSize = 26;
  x.font = `${subSize}px ${SERIF}`;
  while (x.measureText(sub).width > W - 60 && subSize > 12) {
    subSize -= 1;
    x.font = `${subSize}px ${SERIF}`;
  }
  engrave(x, sub, W / 2, H * 0.74, subSize, { dark, light, alpha: 0.72 });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const made = { tex, aspect: W / H };
  cache.set(id, made);
  return made;
}
