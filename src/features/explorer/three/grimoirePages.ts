import type { Entity, EvidenceLevel, Source } from '../../../domain/types';
import { EVIDENCE_META, TYPE_META, CLUSTER_META } from '../../../domain/types';
import { mulberry32, hashString } from '../../../domain/random';
import { frontispiece, plateFor } from './grimoireArt';
import { LEAN_TEXTURES } from './textureBudget';

/**
 * The grimoire press. Typesets an entity onto parchment pages — canvas
 * textures mapped onto the 3D book the visitor lifts from the shelf, and
 * shown full-screen in the enlarged reader. Illuminated: a frontispiece
 * emblem, a drop-capped brief, evidence-chipped claims with footnoted
 * citations, and an interior plate. No DOM, no network.
 */

export const PAGE_W = 760;
export const PAGE_H = 1040;
/**
 * Supersampling. All the typesetting below is written in 760×1040 page space;
 * the backing canvas is this much bigger and the context is scaled to match,
 * so the type is rasterised at 1140×1560 and stays crisp now that the book is
 * held large in front of the camera. Nothing else in the file needs to know.
 */
/**
 * Supersampling for a baked page.
 *
 * The BAKE is cheap — four pages in about 7 ms — so this number is not about
 * drawing time. It is about the UPLOAD: at 1.5 a page is 1140×1560, four of
 * them are 28 MB of RGBA handed to the GPU in one go, and on a phone that
 * stall is the whole of the wait between clicking a book and reading it.
 * Three quarters puts it at 7 MB.
 *
 * The page is still legible enlarged: 570×780 against an iPhone 11's 828
 * device pixels of width is a little soft, and a book that opens is worth
 * more than a book that is sharp four seconds later.
 */
const SS = 1.5 * (LEAN_TEXTURES ? 0.5 : 1);
const M = 82; // margin
const CONTENT_W = PAGE_W - M * 2;
const TOP = 118;
const BOTTOM = PAGE_H - 96;

/**
 * The book's two faces.
 *
 * The body was set in Cormorant Garamond, which is a DISPLAY cut — hairline
 * stems and a small x-height, lovely at 64px on a title page and thin to the
 * point of illegibility at 32px on a page you read across a room. EB Garamond
 * is the text cut of the same tradition: same period, sturdier stems, taller
 * x-height, so it holds up at body size and on a curved 3D leaf.
 *
 * Everything that was Inter — running heads, section headers, evidence chips,
 * the kicker — is now Cinzel, roman inscriptional capitals. A grotesk in a
 * grimoire read like a UI label had been pasted onto the page; Cinzel is the
 * lettering those pages actually used for their heads.
 */
const SERIF = "'EB Garamond', 'Cormorant Garamond', 'Iowan Old Style', Georgia, serif";
const CAPS = "'Cinzel', 'EB Garamond', 'Iowan Old Style', Georgia, serif";

const INK = '#2c2114';
const INK_SOFT = '#6d5b41';
const GOLD = '#7a5218';
const RULE = 'rgba(122, 94, 44, 0.5)';

const EVIDENCE_INK: Record<EvidenceLevel, string> = {
  documented: '#2f6d3f',
  primary: '#22617a',
  scholarship: '#584a92',
  tradition: '#8f5e1a',
  legend: '#94425f',
  speculation: '#9a482b',
};

/* ————————————————— page + primitives ————————————————— */

/**
 * Aged laid paper, drawn from scratch.
 *
 * A flat gradient plus a few dots read as coloured card, not as a sheet with a
 * history — so the stack here is the one a real leaf has: pulp mottle, laid
 * lines and chain lines from the mould, a rag fibre grain, foxing where the
 * damp got in, dirt worn into the outer edge where thumbs go, and the gutter
 * falling into shadow at the spine. Everything is seeded off the entity +
 * page, so a book looks the same every time it is opened but no two leaves in
 * it are twins.
 *
 * Even pages sit on the LEFT of the spread (see OpenBook), so their gutter is
 * on the right; odd pages mirror.
 */
function parchment(entitySeed: string, pageIndex: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_W * SS;
  canvas.height = PAGE_H * SS;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SS, SS);
  const rng = mulberry32(hashString(entitySeed) + pageIndex * 7919);
  /** the spine side of this leaf: +1 = gutter on the right (a left-hand page) */
  const gutter = pageIndex % 2 === 0 ? 1 : -1;

  // ——— pulp: a warm base, unevenly lit as if the lamp is up and to the left ———
  const base = ctx.createLinearGradient(0, 0, PAGE_W * 0.85, PAGE_H);
  base.addColorStop(0, '#ebdcb6');
  base.addColorStop(0.55, '#e1d1a6');
  base.addColorStop(1, '#d1be91');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // large soft mottle — the paper never dried evenly
  for (let i = 0; i < 26; i++) {
    const x = rng() * PAGE_W;
    const y = rng() * PAGE_H;
    const r = 90 + rng() * 260;
    const warm = rng() > 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + rng() * 0.07;
    g.addColorStop(0, warm ? `rgba(168, 132, 78, ${a})` : `rgba(255, 248, 224, ${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ——— the mould: fine laid lines, with chain lines every ~26mm ———
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.strokeStyle = '#7d6236';
  ctx.lineWidth = 1;
  for (let y = 4; y < PAGE_H; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(PAGE_W, y + 0.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.07;
  ctx.lineWidth = 2;
  for (let x = 18 + rng() * 20; x < PAGE_W; x += 62) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, PAGE_H);
    ctx.stroke();
  }
  ctx.restore();

  // ——— rag fibre: short hairs in the pulp, light and dark ———
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = rng() * PAGE_W;
    const y = rng() * PAGE_H;
    const a = rng() * Math.PI;
    const len = 2 + rng() * 9;
    const dark = rng() > 0.42;
    ctx.strokeStyle = dark
      ? `rgba(120, 94, 54, ${0.03 + rng() * 0.07})`
      : `rgba(255, 250, 232, ${0.04 + rng() * 0.09})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();

  // ——— foxing: rust-brown blooms, denser toward the edges where damp creeps in ———
  const foxCount = 10 + Math.floor(rng() * 10);
  for (let i = 0; i < foxCount; i++) {
    // bias toward a margin
    const edge = rng();
    const cx = edge < 0.5 ? rng() * PAGE_W : rng() < 0.5 ? rng() * 120 : PAGE_W - rng() * 120;
    const cy = edge < 0.5 ? (rng() < 0.5 ? rng() * 140 : PAGE_H - rng() * 140) : rng() * PAGE_H;
    const spots = 3 + Math.floor(rng() * 7);
    for (let s = 0; s < spots; s++) {
      const x = cx + (rng() - 0.5) * 70;
      const y = cy + (rng() - 0.5) * 70;
      const r = 2 + rng() * 9;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(140, 88, 38, ${0.14 + rng() * 0.2})`);
      g.addColorStop(0.6, `rgba(146, 102, 52, ${0.07 + rng() * 0.09})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  // ——— a faint old water stain on some leaves ———
  if (rng() > 0.55) {
    const x = rng() * PAGE_W;
    const y = rng() * PAGE_H;
    const r = 130 + rng() * 190;
    const g = ctx.createRadialGradient(x, y, r * 0.45, x, y, r);
    g.addColorStop(0, 'rgba(150, 112, 58, 0.03)');
    g.addColorStop(0.82, 'rgba(140, 100, 48, 0.09)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ——— creases: a couple of soft cockles catching the light ———
  for (let i = 0; i < 3; i++) {
    const y0 = rng() * PAGE_H;
    const y1 = y0 + (rng() - 0.5) * 360;
    ctx.strokeStyle = `rgba(255, 250, 230, ${0.05 + rng() * 0.05})`;
    ctx.lineWidth = 2 + rng() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.quadraticCurveTo(PAGE_W / 2, (y0 + y1) / 2 + (rng() - 0.5) * 60, PAGE_W, y1);
    ctx.stroke();
    ctx.strokeStyle = `rgba(112, 86, 48, ${0.04 + rng() * 0.04})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y0 + 3);
    ctx.quadraticCurveTo(PAGE_W / 2, (y0 + y1) / 2 + (rng() - 0.5) * 60 + 3, PAGE_W, y1 + 3);
    ctx.stroke();
  }

  // ——— dirt worn into the outer edge and corners; the fore-edge is handled ———
  const outer = gutter > 0 ? 0 : PAGE_W; // the thumbed edge, opposite the spine
  const edgeGrad = ctx.createLinearGradient(outer, 0, outer + (gutter > 0 ? 150 : -150), 0);
  edgeGrad.addColorStop(0, 'rgba(96, 70, 34, 0.26)');
  edgeGrad.addColorStop(0.35, 'rgba(104, 78, 40, 0.09)');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  for (const [cx, cy] of [
    [0, 0],
    [PAGE_W, 0],
    [0, PAGE_H],
    [PAGE_W, PAGE_H],
  ] as const) {
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 230);
    g.addColorStop(0, 'rgba(88, 64, 30, 0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 230, cy - 230, 460, 460);
  }
  // top and bottom edges take some too
  const vEdge = ctx.createLinearGradient(0, 0, 0, PAGE_H);
  vEdge.addColorStop(0, 'rgba(96, 70, 34, 0.16)');
  vEdge.addColorStop(0.12, 'rgba(0,0,0,0)');
  vEdge.addColorStop(0.88, 'rgba(0,0,0,0)');
  vEdge.addColorStop(1, 'rgba(96, 70, 34, 0.16)');
  ctx.fillStyle = vEdge;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // ——— the gutter: the leaf curving down into the spine ———
  const gx = gutter > 0 ? PAGE_W : 0;
  const gg = ctx.createLinearGradient(gx, 0, gx - gutter * 120, 0);
  gg.addColorStop(0, 'rgba(52, 36, 16, 0.42)');
  gg.addColorStop(0.35, 'rgba(70, 50, 24, 0.16)');
  gg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gg;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  // the highlight where the curve turns back up into the light
  const gh = ctx.createLinearGradient(gx - gutter * 96, 0, gx - gutter * 168, 0);
  gh.addColorStop(0, 'rgba(255, 248, 226, 0.13)');
  gh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gh;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // ——— the ruled border, printed on top of all that wear ———
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(30, 30, PAGE_W - 60, PAGE_H - 60);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(40, 40, PAGE_W - 80, PAGE_H - 80);
  ctx.textBaseline = 'alphabetic';
  return ctx;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const cand = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(cand).width > maxW) {
      lines.push(line);
      line = w;
    } else line = cand;
  }
  if (line) lines.push(line);
  return lines;
}

function flourish(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(PAGE_W / 2 - 132, y);
  ctx.lineTo(PAGE_W / 2 - 20, y);
  ctx.moveTo(PAGE_W / 2 + 20, y);
  ctx.lineTo(PAGE_W / 2 + 132, y);
  ctx.stroke();
  ctx.save();
  ctx.translate(PAGE_W / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = GOLD;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();
}

/** letterspacing, canvas-style: there is no tracking property, so space it */
function track(s: string): string {
  return s.split('').join(' ');
}

/**
 * The running head: which book you are in, on every page but the title.
 *
 * `aside` is only for pages that carry no section header of their own — on a
 * page that already says IN BRIEF in 23px gold, repeating it in the head is
 * just noise.
 */
function runningHead(ctx: CanvasRenderingContext2D, title: string, aside?: string) {
  ctx.font = `600 14px ${CAPS}`;
  ctx.fillStyle = INK_SOFT;
  ctx.textAlign = 'left';
  const t = title.length > 34 ? `${title.slice(0, 33)}…` : title;
  ctx.fillText(track(t.toUpperCase()), M, 74);
  if (aside) {
    ctx.textAlign = 'right';
    ctx.fillText(track(aside.toUpperCase()), PAGE_W - M, 74);
  }
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(M, 86);
  ctx.lineTo(PAGE_W - M, 86);
  ctx.stroke();
}

/** a sans-serif small-caps section header with a hairline rule beneath */
function sectionHeader(ctx: CanvasRenderingContext2D, label: string, y: number): number {
  ctx.textAlign = 'left';
  ctx.font = `700 21px ${CAPS}`;
  ctx.fillStyle = GOLD;
  const tracked = label.toUpperCase().split('').join(' ');
  ctx.fillText(tracked, M, y);
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(M, y + 12);
  ctx.lineTo(PAGE_W - M, y + 12);
  ctx.stroke();
  return y + 46;
}

function pageNumber(ctx: CanvasRenderingContext2D, n: number) {
  ctx.font = `500 22px ${SERIF}`;
  ctx.fillStyle = INK_SOFT;
  ctx.textAlign = 'center';
  ctx.fillText(`· ${n} ·`, PAGE_W / 2, PAGE_H - 54);
}

function shortCite(source: Source): string {
  const surname = source.author.replace(/\(.*?\)/g, '').trim().split(' ').pop() ?? source.author;
  return `${surname} ${source.year}`;
}

/** draw an image contained within a box, preserving aspect, centred */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return { dx, dy, dw, dh };
}

/** a framed, matted plate — real image if loaded, else an empty gilt frame */
function plateFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  // shadow
  ctx.save();
  ctx.fillStyle = 'rgba(60, 44, 20, 0.18)';
  roundRect(ctx, x + 5, y + 6, w, h, 4);
  ctx.fill();
  ctx.restore();
  // mat — a tipped-in leaf, slightly whiter than the page but foxed at its edge
  ctx.fillStyle = '#eadfbe';
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  const matEdge = ctx.createLinearGradient(x, y, x + w, y + h);
  matEdge.addColorStop(0, 'rgba(140, 104, 52, 0.13)');
  matEdge.addColorStop(0.4, 'rgba(0,0,0,0)');
  matEdge.addColorStop(1, 'rgba(126, 94, 46, 0.16)');
  ctx.fillStyle = matEdge;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  const pad = 12;
  const ix = x + pad;
  const iy = y + pad;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  // picture well
  ctx.fillStyle = '#d9c79c';
  ctx.fillRect(ix, iy, iw, ih);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(ix, iy, iw, ih);
    ctx.clip();
    drawContain(ctx, img, ix, iy, iw, ih);
    // sink the engraving into the paper: a warm wash and a soft plate-mark
    // vignette, so it reads as ink on this leaf rather than a pasted photo
    ctx.globalCompositeOperation = 'multiply';
    const wash = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
    wash.addColorStop(0, 'rgba(226, 208, 168, 0.55)');
    wash.addColorStop(1, 'rgba(206, 184, 140, 0.6)');
    ctx.fillStyle = wash;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.globalCompositeOperation = 'source-over';
    const vig = ctx.createRadialGradient(
      ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.35,
      ix + iw / 2, iy + ih / 2, Math.max(iw, ih) * 0.72,
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(78, 56, 26, 0.3)');
    ctx.fillStyle = vig;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.restore();
  }
  // gilt frame
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(ix, iy, iw, ih);
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
}

/* ————————————————— the press ————————————————— */

export function bakeGrimoire(
  entity: Entity,
  sources: Map<string, Source>,
  relatedNames: string[],
): HTMLCanvasElement[] {
  const pages: HTMLCanvasElement[] = [];
  /** set once the interior plate has been placed, wherever it fitted */
  let plateDrawn = false;

  // ——— 1 · frontispiece: title block + cluster emblem ———
  {
    const ctx = parchment(entity.id, 0);
    ctx.textAlign = 'center';
    ctx.font = `600 18px ${CAPS}`;
    ctx.fillStyle = GOLD;
    const kind = `${TYPE_META[entity.type].label} · ${CLUSTER_META[entity.cluster].label}`;
    let y = TOP + 6;
    for (const line of wrap(ctx, kind.toUpperCase(), CONTENT_W)) {
      ctx.fillText(line, PAGE_W / 2, y);
      y += 32;
    }
    y += 26;
    ctx.font = `700 64px ${SERIF}`;
    ctx.fillStyle = INK;
    for (const line of wrap(ctx, entity.name, CONTENT_W)) {
      ctx.fillText(line, PAGE_W / 2, y);
      y += 66;
    }
    y += 6;
    flourish(ctx, y);
    y += 46;
    ctx.font = `italic 500 33px ${SERIF}`;
    ctx.fillStyle = INK_SOFT;
    for (const line of wrap(ctx, entity.epithet, CONTENT_W - 40)) {
      ctx.fillText(line, PAGE_W / 2, y);
      y += 40;
    }
    if (entity.dates) {
      y += 12;
      ctx.font = `600 20px ${CAPS}`;
      ctx.fillStyle = GOLD;
      ctx.fillText(entity.dates, PAGE_W / 2, y);
      y += 20;
    }
    // the emblem fills the lower half
    const frameTop = Math.max(y + 30, 430);
    const frameH = BOTTOM - frameTop - 4;
    const frameW = Math.min(CONTENT_W, frameH * 0.88);
    plateFrame(ctx, frontispiece(entity.cluster, entity.id), (PAGE_W - frameW) / 2, frameTop, frameW, frameH);
    pageNumber(ctx, 1);
    pages.push(ctx.canvas);
  }

  // ——— 2 · the brief, with an illuminated initial, and the plate beneath ———
  {
    const ctx = parchment(entity.id, 1);
    runningHead(ctx, entity.name);
    let y = sectionHeader(ctx, 'In Brief', TOP);
    y += 10;
    const leading = 49;
    const bodySize = 35;
    const first = entity.summary.charAt(0);
    const rest = entity.summary.slice(1).trimStart();

    // The illuminated initial. Its baseline sits well below the first text
    // line, so any line whose ascender would run into the glyph has to be
    // indented past it — measuring that properly is the whole trick. The old
    // code indented a fixed two lines and the third line ran through the cap.
    const capSize = 96;
    const capBaseline = y + capSize * 0.72;
    ctx.font = `700 ${capSize}px ${SERIF}`;
    ctx.fillStyle = GOLD;
    ctx.textAlign = 'left';
    ctx.fillText(first, M, capBaseline);
    const capW = ctx.measureText(first).width + 18;

    // wrap by hand, choosing the indent line by line from where the baseline
    // falls relative to the initial
    ctx.font = `500 ${bodySize}px ${SERIF}`;
    ctx.fillStyle = INK;
    const ascender = bodySize * 0.74;
    const indentAt = (baseline: number) => (baseline - ascender < capBaseline + 4 ? capW : 0);
    const words = rest.split(/\s+/);
    let line = '';
    for (const w of words) {
      const indent = indentAt(y);
      const cand = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(cand).width > CONTENT_W - indent) {
        ctx.fillText(line, M + indent, y);
        y += leading;
        line = w;
        if (y > BOTTOM) break;
      } else line = cand;
    }
    if (line && y <= BOTTOM) {
      ctx.fillText(line, M + indentAt(y), y);
      y += leading;
    }

    // The plate used to have a page to itself, which left both it and the
    // brief adrift on three-quarters-empty pages. It sits under the brief
    // now — a proper illustrated recto — whenever there is room for it.
    const plate = plateFor(entity.cluster, entity.id);
    const capH = 44;
    const avail = BOTTOM - (y + 22) - capH;
    if (avail > 300) {
      const frameTop = y + 26;
      const frameH = avail;
      const frameW = Math.min(CONTENT_W, frameH * 0.86);
      plateFrame(ctx, plate.img, (PAGE_W - frameW) / 2, frameTop, frameW, frameH);
      ctx.font = `italic 500 26px ${SERIF}`;
      ctx.fillStyle = INK_SOFT;
      ctx.textAlign = 'center';
      let cy = frameTop + frameH + 30;
      for (const l of wrap(ctx, plate.caption, CONTENT_W - 40)) {
        ctx.fillText(l, PAGE_W / 2, cy);
        cy += 28;
      }
      plateDrawn = true;
    } else if (y < BOTTOM - 40) {
      flourish(ctx, y + 18);
    }
    pageNumber(ctx, 2);
    pages.push(ctx.canvas);
  }

  // ——— 3 · the plate, if the brief page had no room for it ———
  if (!plateDrawn) {
    const ctx = parchment(entity.id, 2);
    runningHead(ctx, entity.name);
    const y = sectionHeader(ctx, 'Plate', TOP);
    const plate = plateFor(entity.cluster, entity.id);
    const frameTop = y + 6;
    const frameH = BOTTOM - frameTop - 62;
    const frameW = Math.min(CONTENT_W, frameH * 0.8);
    plateFrame(ctx, plate.img, (PAGE_W - frameW) / 2, frameTop, frameW, frameH);
    ctx.font = `italic 500 27px ${SERIF}`;
    ctx.fillStyle = INK_SOFT;
    ctx.textAlign = 'center';
    let cy = frameTop + frameH + 34;
    for (const l of wrap(ctx, plate.caption, CONTENT_W - 40)) {
      ctx.fillText(l, PAGE_W / 2, cy);
      cy += 29;
    }
    pageNumber(ctx, 3);
    pages.push(ctx.canvas);
  }

  // ——— 4+ · claims, flowed across pages ———
  let ctx = parchment(entity.id, pages.length);
  runningHead(ctx, entity.name);
  let y = sectionHeader(ctx, 'What the Record Holds', TOP);

  /** `aside` labels the new page's running head — omitted when the page is
   *  about to open a section of its own, which prints its own header */
  const newPage = (aside: string | undefined = 'the record, continued') => {
    pageNumber(ctx, pages.length + 1);
    pages.push(ctx.canvas);
    ctx = parchment(entity.id, pages.length + 1);
    runningHead(ctx, entity.name, aside);
    y = TOP;
  };

  // claim blocks: an evidence chip, the claim, its citation, and a coloured
  // rule down the left so the standing of a claim can be read at a glance
  // without stopping to read the chip
  const CLAIM_LEAD = 47;
  const CLAIM_INDENT = 22;
  for (const claim of entity.claims) {
    ctx.font = `500 34px ${SERIF}`;
    const bodyLines = wrap(ctx, claim.text, CONTENT_W - CLAIM_INDENT);
    const cites = claim.sources
      .map((id) => sources.get(id))
      .filter((s): s is Source => Boolean(s))
      .map(shortCite)
      .join(' · ');
    const blockH = 38 + bodyLines.length * CLAIM_LEAD + (cites ? 36 : 0) + 30;
    if (y + blockH > BOTTOM) newPage();
    const blockTop = y - 22;

    // evidence chip
    const label = EVIDENCE_META[claim.evidence].label.toUpperCase();
    ctx.textAlign = 'left';
    ctx.font = `700 14px ${CAPS}`;
    const chipW = ctx.measureText(track(label)).width + 24;
    ctx.fillStyle = EVIDENCE_INK[claim.evidence];
    roundRect(ctx, M + CLAIM_INDENT, y - 20, chipW, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#f6edd6';
    ctx.fillText(track(label), M + CLAIM_INDENT + 12, y);
    y += 38;

    // body
    ctx.font = `500 34px ${SERIF}`;
    ctx.fillStyle = INK;
    for (const bl of bodyLines) {
      ctx.fillText(bl, M + CLAIM_INDENT, y);
      y += CLAIM_LEAD;
    }
    // citation, hanging under the claim it supports
    if (cites) {
      ctx.font = `italic 500 26px ${SERIF}`;
      ctx.fillStyle = INK_SOFT;
      ctx.fillText(`— ${cites}`, M + CLAIM_INDENT, y);
      y += 36;
    }
    // the evidence rule, drawn last now that the block's height is known
    ctx.strokeStyle = EVIDENCE_INK[claim.evidence];
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(M + 4, blockTop);
    ctx.lineTo(M + 4, y - 26);
    ctx.stroke();
    ctx.globalAlpha = 1;
    y += 30;
  }

  // ——— connections colophon ———
  // Reserve the space it actually needs before deciding to break: measuring
  // after the fact used to strand it alone on an otherwise empty page.
  if (relatedNames.length > 0) {
    ctx.font = `italic 500 30px ${SERIF}`;
    const threadLines = wrap(ctx, relatedNames.join('  ·  '), CONTENT_W);
    const needed = 74 + threadLines.length * 39;
    if (y + needed > BOTTOM) newPage(undefined);
    else y += 10;
    y = sectionHeader(ctx, 'The Thread Continues', y);
    ctx.font = `italic 500 30px ${SERIF}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    for (const line of threadLines) {
      if (y > BOTTOM) break;
      ctx.fillText(line, M, y);
      y += 39;
    }
  }
  pageNumber(ctx, pages.length + 1);
  pages.push(ctx.canvas);

  // blank verso so spreads always pair up
  if (pages.length % 2 !== 0) {
    const blank = parchment(entity.id, pages.length + 1);
    pageNumber(blank, pages.length + 1);
    pages.push(blank.canvas);
  }
  return pages;
}
