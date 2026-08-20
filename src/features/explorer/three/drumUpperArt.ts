import * as THREE from 'three';
import { makeTexture, shade } from './textures';
import { mulberry32 } from '../../../domain/random';
import { texMarks } from './textureBudget';

/**
 * The engraved content of the upper drum.
 *
 * Everything painted here is CARVING, not decoration and never a light source:
 * a bronze frieze that has gone brown in its hollows, roundels cut into stone,
 * plaques with their gilding worn out of the high spots. Nothing glows. The
 * upper drum is fourteen metres up in a room graded to 85% shadow, and the one
 * thing that would ruin it is a band of bright symbols floating in the dark.
 *
 * ── how relief is faked, and why it has to be ──────────────────────────────
 *
 * There is no normal map behind any of this and no ambient occlusion in the
 * renderer, so a motif drawn as a flat gold line reads as PAINT. Everything
 * incised here is therefore drawn three times: a dark pass offset down-right
 * (the shadow the chisel leaves in the groove), a light pass offset up-left
 * (the lit lower lip of the cut), and the body of the mark between them. That
 * is the whole trick, it is two extra strokes, and it is the difference
 * between a carved wall and a printed one.
 */

type Ctx = CanvasRenderingContext2D;
type Rng = () => number;

const BRONZE = '#7e6236';
const BRONZE_DK = '#3d2f1a';
const BRONZE_LT = '#a98b4c';
const VERDIGRIS = '#4d6355';
/**
 * The stone the roundels and plaques are cut from, and it is DARK on purpose.
 *
 * The first cut used a pale limestone. At fourteen metres, in a room graded to
 * 85% shadow, a pale field with gilt engraving on it loses all its contrast
 * and reads as a blank sign hung on the wall — which is exactly what these
 * must not look like. A dark field with the gilding surviving in the cuts is
 * both what an unwashed carved stone actually looks like after four centuries
 * and the only thing that stays legible at that distance.
 */
const STONE = '#4a4437';
const STONE_DK = '#332f26';
const GOLD = '#c6a259';

/** Zodiac symbols are emoji-presentation codepoints, so Chrome hands them to
 *  the colour emoji font and a carved bronze frieze comes out full of pink
 *  cartoons. U+FE0E forces the text glyph the serif face actually has. */
const TEXT_PRESENTATION = '︎';

/* ————————————————————— shared marks ————————————————————— */

/** A cut line: shadow below-right, lit lip above-left, body between. This is
 *  the only way anything gets incised in this file. */
function incise(
  ctx: Ctx,
  draw: (c: Ctx) => void,
  width: number,
  body = GOLD,
  depth = 1,
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.translate(depth, depth);
  ctx.strokeStyle = 'rgba(14,10,5,0.72)';
  ctx.lineWidth = width;
  ctx.beginPath();
  draw(ctx);
  ctx.stroke();
  ctx.translate(-depth * 2, -depth * 2);
  ctx.strokeStyle = 'rgba(255,236,196,0.30)';
  ctx.lineWidth = width * 0.8;
  ctx.beginPath();
  draw(ctx);
  ctx.stroke();
  ctx.translate(depth, depth);
  ctx.strokeStyle = body;
  ctx.lineWidth = width * 0.85;
  ctx.beginPath();
  draw(ctx);
  ctx.stroke();
  ctx.restore();
}

/** the same treatment for a filled shape — a boss, a disc, a glyph */
function relief(ctx: Ctx, draw: (c: Ctx) => void, body: string, depth = 2): void {
  ctx.save();
  ctx.translate(depth, depth);
  ctx.fillStyle = 'rgba(12,9,4,0.6)';
  ctx.beginPath();
  draw(ctx);
  ctx.fill();
  ctx.translate(-depth * 1.6, -depth * 1.6);
  ctx.fillStyle = 'rgba(255,240,205,0.22)';
  ctx.beginPath();
  draw(ctx);
  ctx.fill();
  ctx.translate(depth * 0.6, depth * 0.6);
  ctx.fillStyle = body;
  ctx.beginPath();
  draw(ctx);
  ctx.fill();
  ctx.restore();
}

/** cast metal: a mottled ground with casting pits, wear on the proud parts and
 *  verdigris gathered where water would sit */
function castBronze(ctx: Ctx, rng: Rng, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, shade(BRONZE, -0.1));
  g.addColorStop(0.4, BRONZE);
  g.addColorStop(1, shade(BRONZE, -0.16));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 0.6 + rng() * 2.6;
    ctx.globalAlpha = 0.05 + rng() * 0.14;
    ctx.fillStyle = rng() > 0.45 ? BRONZE_DK : BRONZE_LT;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // verdigris pools in the lower third, where a century of damp runs to
  for (let i = 0; i < 60; i++) {
    const x = rng() * w;
    const y = h * (0.55 + rng() * 0.45);
    ctx.globalAlpha = 0.05 + rng() * 0.1;
    ctx.fillStyle = VERDIGRIS;
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + rng() * 26, 3 + rng() * 12, rng() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // vertical weathering streaks
  for (let i = 0; i < 40; i++) {
    const x = rng() * w;
    ctx.globalAlpha = 0.05 + rng() * 0.08;
    ctx.fillStyle = BRONZE_DK;
    ctx.fillRect(x, 0, 1 + rng() * 3, h);
  }
  ctx.globalAlpha = 1;
}

/** cut stone: pale, close-grained, with tool chatter and dirt in the pores */
function cutStone(ctx: Ctx, rng: Rng, x: number, y: number, w: number, h: number, base = STONE): void {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  // scattered by the canvas's own size, not by a desktop's — see texMarks.
  // Two of these run per plaque and per roundel, eighteen cells in all, and at
  // full count they were the single largest thing standing between a phone and
  // its first frame.
  for (let i = 0, n = texMarks(1200); i < n; i++) {
    const px = x + rng() * w;
    const py = y + rng() * h;
    ctx.globalAlpha = 0.04 + rng() * 0.1;
    ctx.fillStyle = rng() > 0.5 ? shade(base, 0.09) : shade(base, -0.11);
    ctx.fillRect(px, py, 1 + rng() * 3, 1 + rng() * 2);
  }
  // claw-chisel chatter, all running one way as a mason's would
  for (let i = 0, n = texMarks(90); i < n; i++) {
    const py = y + rng() * h;
    ctx.globalAlpha = 0.05 + rng() * 0.07;
    ctx.strokeStyle = shade(base, -0.14);
    ctx.lineWidth = 0.8 + rng();
    ctx.beginPath();
    ctx.moveTo(x + rng() * w * 0.7, py);
    ctx.lineTo(x + rng() * w * 0.7 + 20 + rng() * 60, py + (rng() - 0.5) * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ————————————————————— the frieze ————————————————————— */

/** the small motifs that march round the frieze, drawn in a unit box −1..1 */
type Motif = (ctx: Ctx, r: number) => void;

const armillary: Motif = (ctx, r) => {
  incise(ctx, (c) => c.arc(0, 0, r * 0.9, 0, Math.PI * 2), r * 0.1, GOLD);
  incise(ctx, (c) => c.ellipse(0, 0, r * 0.9, r * 0.3, 0, 0, Math.PI * 2), r * 0.08, GOLD);
  incise(ctx, (c) => c.ellipse(0, 0, r * 0.32, r * 0.9, 0, 0, Math.PI * 2), r * 0.08, GOLD);
  incise(
    ctx,
    (c) => {
      c.moveTo(0, -r * 1.05);
      c.lineTo(0, r * 1.05);
    },
    r * 0.07,
    GOLD,
  );
  relief(ctx, (c) => c.arc(0, 0, r * 0.13, 0, Math.PI * 2), BRONZE_LT);
};

const comet: Motif = (ctx, r) => {
  relief(ctx, (c) => c.arc(r * 0.35, -r * 0.2, r * 0.22, 0, Math.PI * 2), BRONZE_LT);
  for (let i = -2; i <= 2; i++) {
    incise(
      ctx,
      (c) => {
        c.moveTo(r * 0.2, -r * 0.2 + i * r * 0.1);
        c.quadraticCurveTo(-r * 0.4, -r * 0.1 + i * r * 0.3, -r * 0.95, i * r * 0.42);
      },
      r * 0.07,
      GOLD,
    );
  }
};

const sunFace: Motif = (ctx, r) => {
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const l = i % 2 ? r * 0.95 : r * 0.72;
    incise(
      ctx,
      (c) => {
        c.moveTo(Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.48);
        c.lineTo(Math.cos(a) * l, Math.sin(a) * l);
      },
      r * 0.09,
      GOLD,
    );
  }
  relief(ctx, (c) => c.arc(0, 0, r * 0.45, 0, Math.PI * 2), shade(BRONZE, 0.08));
  incise(ctx, (c) => c.arc(0, 0, r * 0.45, 0, Math.PI * 2), r * 0.06, BRONZE_DK);
};

const crescentStar: Motif = (ctx, r) => {
  relief(
    ctx,
    (c) => {
      c.arc(0, 0, r * 0.8, Math.PI * 0.35, Math.PI * 1.65);
      c.arc(r * 0.22, 0, r * 0.68, Math.PI * 1.6, Math.PI * 0.4, true);
      c.closePath();
    },
    shade(BRONZE, 0.06),
  );
  incise(
    ctx,
    (c) => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        c.moveTo(r * 0.55, -r * 0.05);
        c.lineTo(r * 0.55 + Math.cos(a) * r * 0.3, -r * 0.05 + Math.sin(a) * r * 0.3);
      }
    },
    r * 0.07,
    GOLD,
  );
};

const dividers: Motif = (ctx, r) => {
  incise(
    ctx,
    (c) => {
      c.moveTo(-r * 0.55, r * 0.85);
      c.lineTo(0, -r * 0.85);
      c.lineTo(r * 0.55, r * 0.85);
    },
    r * 0.11,
    GOLD,
  );
  incise(
    ctx,
    (c) => {
      c.moveTo(-r * 0.34, r * 0.2);
      c.lineTo(r * 0.34, r * 0.2);
    },
    r * 0.07,
    GOLD,
  );
  relief(ctx, (c) => c.arc(0, -r * 0.85, r * 0.13, 0, Math.PI * 2), BRONZE_LT);
};

const astrolabe: Motif = (ctx, r) => {
  incise(ctx, (c) => c.arc(0, 0, r * 0.92, 0, Math.PI * 2), r * 0.1, GOLD);
  incise(ctx, (c) => c.arc(0, 0, r * 0.66, 0, Math.PI * 2), r * 0.06, GOLD);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    incise(
      ctx,
      (c) => {
        c.moveTo(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66);
        c.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
      },
      r * 0.045,
      GOLD,
    );
  }
  incise(
    ctx,
    (c) => {
      c.moveTo(-r * 0.62, r * 0.34);
      c.lineTo(r * 0.62, -r * 0.34);
    },
    r * 0.08,
    GOLD,
  );
  relief(ctx, (c) => c.arc(0, 0, r * 0.11, 0, Math.PI * 2), BRONZE_LT);
};

const FRIEZE_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const FRIEZE_MOTIFS: Motif[] = [armillary, comet, sunFace, crescentStar, dividers, astrolabe];

/** a wreath framing a zodiac glyph — the alternate bay of the frieze */
function wreath(ctx: Ctx, rng: Rng, r: number, glyph: string): void {
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const rr = r * (0.82 + (rng() - 0.5) * 0.06);
    ctx.save();
    ctx.translate(Math.cos(a) * rr, Math.sin(a) * rr);
    ctx.rotate(a + Math.PI / 2);
    relief(ctx, (c) => c.ellipse(0, 0, r * 0.2, r * 0.075, 0, 0, Math.PI * 2), shade(BRONZE, 0.04), 1.4);
    ctx.restore();
  }
  const g = glyph + TEXT_PRESENTATION;
  ctx.save();
  ctx.font = `${Math.round(r * 1.05)}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(12,9,4,0.65)';
  ctx.fillText(g, 2, r * 0.04 + 2);
  ctx.fillStyle = 'rgba(255,238,200,0.26)';
  ctx.fillText(g, -1.6, r * 0.04 - 1.6);
  ctx.fillStyle = GOLD;
  ctx.fillText(g, 0, r * 0.04);
  ctx.restore();
}

/**
 * The bronze astronomical frieze running under the gallery cornice.
 *
 * Tiles in x every 4 metres of wall (twelve bays round the drum), so the
 * zodiac happens to come round once — which is a coincidence worth keeping,
 * not a claim the geometry enforces.
 */
export function bronzeFrieze(seed = 811): THREE.CanvasTexture {
  return makeTexture(`bronze-frieze|${seed}`, [2048, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    castBronze(ctx, rng, w, h);

    // bead-and-reel rules top and bottom, which is what stops a band of
    // ornament from reading as a poster stuck to the wall
    for (const y of [16, h - 16]) {
      incise(
        ctx,
        (c) => {
          c.moveTo(0, y);
          c.lineTo(w, y);
        },
        5,
        shade(BRONZE, 0.14),
      );
      for (let x = 10; x < w; x += 24) {
        relief(ctx, (c) => c.arc(x, y, 4.5, 0, Math.PI * 2), shade(BRONZE, 0.1), 1.4);
        relief(ctx, (c) => c.ellipse(x + 12, y, 2.2, 5.5, 0, 0, Math.PI * 2), shade(BRONZE, 0.02), 1.2);
      }
    }

    // eight bays; the zodiac wreaths and the instruments alternate
    const BAYS = 8;
    const bw = w / BAYS;
    for (let i = 0; i < BAYS; i++) {
      const cx = bw * (i + 0.5);
      const cy = h / 2;
      // the pilasterette dividing one bay from the next
      const dx = bw * i;
      relief(ctx, (c) => c.rect(dx - 5, 26, 10, h - 52), shade(BRONZE, 0.05));
      incise(
        ctx,
        (c) => {
          c.moveTo(dx, 34);
          c.lineTo(dx, h - 34);
        },
        2.5,
        BRONZE_DK,
      );

      ctx.save();
      ctx.translate(cx, cy);
      if (i % 2 === 0) {
        wreath(ctx, rng, h * 0.36, FRIEZE_GLYPHS[(i / 2 + Math.floor(seed / 7)) % 12]);
      } else {
        FRIEZE_MOTIFS[((i - 1) / 2) % FRIEZE_MOTIFS.length](ctx, h * 0.33);
      }
      ctx.restore();
    }

    // knocks and losses: a cast band this old is never continuous
    for (let i = 0; i < 26; i++) {
      const x = rng() * w;
      const y = 24 + rng() * (h - 48);
      ctx.globalAlpha = 0.1 + rng() * 0.2;
      ctx.fillStyle = rng() > 0.5 ? BRONZE_DK : VERDIGRIS;
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + rng() * 20, 3 + rng() * 9, rng() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/* ————————————————————— the roundels ————————————————————— */

/** a constellation: bright stars, their joining lines, and nothing else */
function constellation(ctx: Ctx, rng: Rng, r: number, pts: [number, number][], links: [number, number][]): void {
  for (const [a, b] of links) {
    incise(
      ctx,
      (c) => {
        c.moveTo(pts[a][0] * r, pts[a][1] * r);
        c.lineTo(pts[b][0] * r, pts[b][1] * r);
      },
      r * 0.055,
      shade(GOLD, -0.06),
    );
  }
  pts.forEach((p, i) => {
    const mag = i % 3 === 0 ? 0.11 : 0.075;
    relief(ctx, (c) => c.arc(p[0] * r, p[1] * r, r * mag * (0.8 + rng() * 0.4), 0, Math.PI * 2), GOLD, 1.8);
  });
}

/** the eight roundels, in atlas order */
const ROUNDELS: ((ctx: Ctx, rng: Rng, r: number) => void)[] = [
  // the Plough — the one figure everyone finds
  (ctx, rng, r) =>
    constellation(
      ctx,
      rng,
      r,
      [
        [-0.62, 0.3],
        [-0.34, 0.42],
        [-0.06, 0.36],
        [0.12, 0.12],
        [0.4, 0.02],
        [0.58, -0.24],
        [0.34, -0.4],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 3],
      ],
    ),
  // Orion
  (ctx, rng, r) =>
    constellation(
      ctx,
      rng,
      r,
      [
        [-0.4, -0.62],
        [0.36, -0.5],
        [-0.16, -0.06],
        [0.02, -0.02],
        [0.2, 0.02],
        [-0.34, 0.56],
        [0.44, 0.6],
      ],
      [
        [0, 2],
        [1, 4],
        [2, 3],
        [3, 4],
        [2, 5],
        [4, 6],
      ],
    ),
  // an armillary
  (ctx, _rng, r) => armillary(ctx, r * 0.8),
  // an astrolabe rete
  (ctx, _rng, r) => astrolabe(ctx, r * 0.82),
  // the Moon in its phases, running round the field
  (ctx, _rng, r) => {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(a) * r * 0.6;
      const cy = Math.sin(a) * r * 0.6;
      const k = (i / 8) * 2 - 1;
      ctx.save();
      ctx.translate(cx, cy);
      relief(ctx, (c) => c.arc(0, 0, r * 0.15, 0, Math.PI * 2), shade(STONE, 0.1), 1.4);
      relief(
        ctx,
        (c) => {
          c.arc(0, 0, r * 0.15, -Math.PI / 2, Math.PI / 2);
          c.ellipse(0, 0, r * 0.15 * Math.abs(k), r * 0.15, 0, Math.PI / 2, -Math.PI / 2, k > 0);
        },
        GOLD,
        1.2,
      );
      ctx.restore();
    }
    relief(ctx, (c) => c.arc(0, 0, r * 0.16, 0, Math.PI * 2), shade(GOLD, -0.1));
  },
  // a comet, with the year some canon of the house recorded it
  (ctx, _rng, r) => comet(ctx, r * 0.85),
  // the sun in splendour
  (ctx, _rng, r) => sunFace(ctx, r * 0.82),
  // dividers over a terrestrial globe — the surveyor's roundel
  (ctx, _rng, r) => {
    incise(ctx, (c) => c.arc(0, r * 0.12, r * 0.66, 0, Math.PI * 2), r * 0.05, shade(GOLD, -0.08));
    for (let i = -2; i <= 2; i++) {
      incise(
        ctx,
        (c) => c.ellipse(0, r * 0.12, r * 0.66 * Math.abs(i / 2.6), r * 0.66, 0, 0, Math.PI * 2),
        r * 0.025,
        shade(GOLD, -0.14),
      );
      incise(
        ctx,
        (c) => {
          const yy = r * 0.12 + (i / 2.6) * r * 0.66;
          const hw = r * 0.66 * Math.sqrt(Math.max(0, 1 - (i / 2.6) ** 2));
          c.moveTo(-hw, yy);
          c.lineTo(hw, yy);
        },
        r * 0.025,
        shade(GOLD, -0.14),
      );
    }
    dividers(ctx, r * 0.7);
  },
];

const ROUNDEL_CELL = 512;
export const ROUNDEL_COLS = 4;
export const ROUNDEL_ROWS = 2;
export const ROUNDEL_COUNT = ROUNDEL_COLS * ROUNDEL_ROWS;

/**
 * Eight carved roundels in one atlas, so ten medallions round the drum cost
 * ONE material and merge into ONE mesh. Two of the eight are used twice, on
 * opposite sides of the room where they cannot be seen together.
 */
export function celestialRoundels(seed = 523): THREE.CanvasTexture {
  return makeTexture(
    `celestial-roundels|${seed}`,
    [ROUNDEL_CELL * ROUNDEL_COLS, ROUNDEL_CELL * ROUNDEL_ROWS],
    (ctx, w, h) => {
      /*
       * DRAW IN NOMINAL COORDINATES ON WHATEVER CANVAS WE WERE GIVEN.
       *
       * `make` paints a phone's canvases at TEXTURE_SCALE (see textureBudget)
       * and hands the painter the size it actually got. Everything below is
       * laid out in 512 px cells against the FULL 2048×1024 sheet, so without
       * this the eight roundels were struck at desktop pitch onto an 860 px
       * canvas: cell 0 filled the whole texture and the other seven were drawn
       * off the edge — painted in full, at full cost, and never seen. The
       * medallions round the drum then sampled atlas cells that had nothing in
       * them, which is why the upper order was blank stone on a phone.
       */
      ctx.scale(w / (ROUNDEL_CELL * ROUNDEL_COLS), h / (ROUNDEL_CELL * ROUNDEL_ROWS));
      const rng = mulberry32(seed);
      const S = ROUNDEL_CELL;
      const C = S / 2;
      for (let i = 0; i < ROUNDEL_COUNT; i++) {
        const ox = (i % ROUNDEL_COLS) * S;
        const oy = Math.floor(i / ROUNDEL_COLS) * S;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.beginPath();
        ctx.rect(0, 0, S, S);
        ctx.clip();

        // the block the roundel is cut out of, then the sunk field inside it
        cutStone(ctx, rng, 0, 0, S, S, STONE_DK);
        ctx.save();
        ctx.beginPath();
        ctx.arc(C, C, C * 0.9, 0, Math.PI * 2);
        ctx.clip();
        cutStone(ctx, rng, 0, 0, S, S, STONE);
        // the field is dished: lighter at the top lip, dark at the bottom, the
        // way a shallow bowl reads under light coming from anywhere above
        const dish = ctx.createLinearGradient(0, C * 0.2, 0, S);
        dish.addColorStop(0, 'rgba(0,0,0,0.34)');
        dish.addColorStop(0.45, 'rgba(0,0,0,0.05)');
        dish.addColorStop(1, 'rgba(255,240,210,0.10)');
        ctx.fillStyle = dish;
        ctx.fillRect(0, 0, S, S);
        ctx.restore();

        // the bronze rim, and a bead course inside it
        ctx.save();
        ctx.translate(C, C);
        incise(ctx, (c) => c.arc(0, 0, C * 0.9, 0, Math.PI * 2), 13, shade(BRONZE, 0.05), 2.4);
        incise(ctx, (c) => c.arc(0, 0, C * 0.79, 0, Math.PI * 2), 4, shade(BRONZE, -0.04), 1.6);
        for (let k = 0; k < 48; k++) {
          const a = (k / 48) * Math.PI * 2;
          relief(
            ctx,
            (c) => c.arc(Math.cos(a) * C * 0.845, Math.sin(a) * C * 0.845, 5, 0, Math.PI * 2),
            shade(BRONZE, 0.08),
            1.2,
          );
        }
        ROUNDELS[i](ctx, rng, C * 0.66);
        ctx.restore();

        // chips off the rim and dirt in the lower crevices — no two the same
        for (let k = 0; k < 5; k++) {
          const a = rng() * Math.PI * 2;
          ctx.globalAlpha = 0.35 + rng() * 0.3;
          ctx.fillStyle = STONE_DK;
          ctx.beginPath();
          ctx.arc(C + Math.cos(a) * C * 0.9, C + Math.sin(a) * C * 0.9, 4 + rng() * 13, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 0.16;
        const dirt = ctx.createLinearGradient(0, S * 0.6, 0, S);
        dirt.addColorStop(0, 'rgba(0,0,0,0)');
        dirt.addColorStop(1, 'rgba(20,16,10,0.85)');
        ctx.fillStyle = dirt;
        ctx.fillRect(0, 0, S, S);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    },
    false,
  );
}

/* ————————————————————— the plaques over the figures ————————————————————— */

/** the ten plaques: a constellation or a diagram, and the line beneath it */
const PLAQUES: { title: string; draw: (ctx: Ctx, rng: Rng, r: number) => void }[] = [
  { title: 'VRSA MAIOR', draw: (c, g, r) => ROUNDELS[0](c, g, r) },
  { title: 'ORION', draw: (c, g, r) => ROUNDELS[1](c, g, r) },
  { title: 'SPHAERA MVNDI', draw: (c, _g, r) => armillary(c, r * 0.86) },
  { title: 'ASTROLABIVM', draw: (c, _g, r) => astrolabe(c, r * 0.88) },
  { title: 'LVNA', draw: (c, g, r) => ROUNDELS[4](c, g, r) },
  { title: 'STELLA CRINITA', draw: (c, _g, r) => comet(c, r * 0.9) },
  { title: 'SOL INVICTVS', draw: (c, _g, r) => sunFace(c, r * 0.86) },
  { title: 'GEOMETRIA', draw: (c, _g, r) => dividers(c, r * 0.92) },
  { title: 'CYNOSVRA', draw: (c, g, r) => constellation(c, g, r, [[-0.6, 0.4], [-0.3, 0.36], [0, 0.24], [0.24, 0.02], [0.34, -0.3], [0.1, -0.44], [-0.16, -0.3]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]) },
  { title: 'HOROLOGIVM', draw: (c, _g, r) => crescentStar(c, r * 0.9) },
];

const PLAQUE_W = 512;
const PLAQUE_H = 320;
export const PLAQUE_COLS = 5;
export const PLAQUE_ROWS = 2;
export const PLAQUE_COUNT = PLAQUE_COLS * PLAQUE_ROWS;

/**
 * The ten small carved plaques set into the wall above the statues — one per
 * pier, all in one atlas for the same reason as the roundels.
 *
 * They are cut in the SAME stone as the roundels rather than in brass. A brass
 * plate at this height would be the brightest thing on the drum and would pull
 * the eye off the figure standing under it, which is the opposite of the job.
 */
export function constellationPlaques(seed = 337): THREE.CanvasTexture {
  return makeTexture(
    `constellation-plaques|${seed}`,
    [PLAQUE_W * PLAQUE_COLS, PLAQUE_H * PLAQUE_ROWS],
    (ctx, w, h) => {
      // the same atlas rule as `celestialRoundels` above — draw the sheet at
      // its nominal pitch and let the transform fit it to the canvas the
      // device budget actually allowed
      ctx.scale(w / (PLAQUE_W * PLAQUE_COLS), h / (PLAQUE_H * PLAQUE_ROWS));
      const rng = mulberry32(seed);
      for (let i = 0; i < PLAQUE_COUNT; i++) {
        const ox = (i % PLAQUE_COLS) * PLAQUE_W;
        const oy = Math.floor(i / PLAQUE_COLS) * PLAQUE_H;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.beginPath();
        ctx.rect(0, 0, PLAQUE_W, PLAQUE_H);
        ctx.clip();

        cutStone(ctx, rng, 0, 0, PLAQUE_W, PLAQUE_H, STONE_DK);
        // the sunk field, with the shadow the rebate throws along its top edge
        cutStone(ctx, rng, 26, 22, PLAQUE_W - 52, PLAQUE_H - 44, shade(STONE, -0.04));
        const rebate = ctx.createLinearGradient(0, 22, 0, 22 + 46);
        rebate.addColorStop(0, 'rgba(0,0,0,0.5)');
        rebate.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rebate;
        ctx.fillRect(26, 22, PLAQUE_W - 52, 46);
        ctx.fillStyle = 'rgba(255,240,210,0.09)';
        ctx.fillRect(26, PLAQUE_H - 30, PLAQUE_W - 52, 8);

        ctx.save();
        ctx.translate(PLAQUE_W / 2, PLAQUE_H * 0.4);
        PLAQUES[i].draw(ctx, rng, PLAQUE_H * 0.34);
        ctx.restore();

        // the name, letter-spaced and cut rather than printed
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const spaced = [...PLAQUES[i].title].join(' ');
        let px = 40;
        ctx.font = `${px}px "Cormorant Garamond", Georgia, serif`;
        const maxW = PLAQUE_W - 120;
        if (ctx.measureText(spaced).width > maxW) {
          px = Math.floor(px * (maxW / ctx.measureText(spaced).width));
          ctx.font = `${px}px "Cormorant Garamond", Georgia, serif`;
        }
        const ty = PLAQUE_H - 54;
        ctx.fillStyle = 'rgba(12,9,4,0.7)';
        ctx.fillText(spaced, PLAQUE_W / 2 + 2, ty + 2);
        ctx.fillStyle = 'rgba(255,240,205,0.24)';
        ctx.fillText(spaced, PLAQUE_W / 2 - 1.5, ty - 1.5);
        ctx.fillStyle = shade(GOLD, -0.1);
        ctx.fillText(spaced, PLAQUE_W / 2, ty);
        ctx.restore();

        // centuries of dust gathering on the bottom rebate
        const dust = ctx.createLinearGradient(0, PLAQUE_H * 0.55, 0, PLAQUE_H);
        dust.addColorStop(0, 'rgba(0,0,0,0)');
        dust.addColorStop(1, 'rgba(26,20,12,0.5)');
        ctx.fillStyle = dust;
        ctx.fillRect(0, 0, PLAQUE_W, PLAQUE_H);
        ctx.restore();
      }
    },
    false,
  );
}
