import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../../../domain/random';
import { SKY_PERCH, perchesFor, type Perch } from './perches';

/**
 * The library's inhabitants: an owl working the gallery and the case tops, and
 * a party of chickadees foraging the stacks. All procedural, all gentle — life,
 * not spectacle.
 *
 * There were four-legged residents here too — a spirit-fox trotting a lap of
 * the rotunda, and two cats. All are gone (see the note at their old call site
 * in GrandLibrary): each of them read as something other than what it was, and
 * the birds carry the hall on their own.
 *
 * ── how a bird here works ───────────────────────────────────────────────────
 *
 * Both species run the same two-state loop — PERCHED, then a FLIGHT to another
 * perch — but almost everything inside those two states is species-specific,
 * because the whole point of the rewrite was that an owl and a chickadee should
 * not move alike.
 *
 * PERCHED is not "stand still and sway". It is a queue of small discrete acts —
 * a head saccade held for a beat, a preen into the shoulder, a rouse (the shake
 * that resettles the feathers), a hop along the timber, a turn to face the other
 * way — chosen by weight from the species' repertoire. Discreteness is the
 * realism: a bird holds a pose and then snaps out of it, and a sine wave never
 * holds anything.
 *
 * FLIGHT is a cubic Bézier whose control points come from the two perches rather
 * than from the midpoint of the straight line between them. The bird leaves
 * ALONG the way the departure perch faces (you step off a rail forwards, not
 * sideways), and arrives from BELOW the destination and climbing, which is how
 * every bird lands on anything: the climb is what kills the airspeed, and the
 * flare at the top of it is the pose everyone recognises. On the way it banks
 * into its turns, folds its legs, and beats its wings only when it is working —
 * the owl glides the descents, and the chickadee flies the passerine bound:
 * flap-flap-flap, wings shut, fall, repeat.
 */

/* ————— the shared flight machinery ————— */

interface Species {
  /** which perches this bird will use, and how it behaves on them */
  perches: Perch[];
  /** cruising speed, m/s */
  cruise: number;
  /** radians/s of the powered wingbeat */
  beat: number;
  /** how long it sits, min and span, in seconds */
  rest: [number, number];
  /** amplitude of the bounding flight's undulation — 0 for a bird that glides */
  bound: number;
  /** how far it will normally travel for the next perch */
  reach: number;
  /** chance per departure of leaving through the oculus altogether */
  skyOdds: number;
}

interface Bird {
  mode: 'perched' | 'flight';
  perch: Perch;
  /** how far along the perch's own timber it has shuffled */
  offset: number;
  next: Perch;
  nextOffset: number;
  /** perched: seconds left in the current act. flight: 0‥1 along the path */
  timer: number;
  /** acts performed on this perch, against the patience drawn for it */
  sat: number;
  patience: number;
  t: number;
  dur: number;
  act: 'watch' | 'preen' | 'rouse' | 'hop' | 'turn' | 'doze';
  /** the hop in progress, if any: elapsed, length, and its start offset */
  hop: number;
  hopFrom: number;
  hopTo: number;
  /** where the body is pointing, and where it wants to point */
  yaw: number;
  yawWant: number;
  /** head, relative to the body */
  headYaw: number;
  headYawWant: number;
  headPitch: number;
  headPitchWant: number;
  /** 0 open, 1 shut */
  lid: number;
  blink: number;
  /** roll, damped, so a bank leads and trails the turn it belongs to */
  roll: number;
  /** the current path */
  p0: THREE.Vector3;
  c0: THREE.Vector3;
  c1: THREE.Vector3;
  p1: THREE.Vector3;
  /** the last position, for deriving heading and turn rate */
  last: THREE.Vector3;
  lastYaw: number;
}

/** point on a cubic Bézier */
function bez(out: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, t: number) {
  const s = 1 - t;
  return out
    .set(0, 0, 0)
    .addScaledVector(a, s * s * s)
    .addScaledVector(b, 3 * s * s * t)
    .addScaledVector(c, 3 * s * t * t)
    .addScaledVector(d, t * t * t);
}

/** where a bird standing at `offset` along a perch actually is */
function standAt(out: THREE.Vector3, p: Perch, offset: number) {
  return out.copy(p.pos).addScaledVector(p.along, offset);
}

/**
 * Pick somewhere to go.
 *
 * Birds are not uniformly-random samplers of the room. They mostly move a short
 * way — to the next bay, along to the next stretch of rail — and occasionally
 * cross the whole hall. Weighting by distance against the species' `reach` gives
 * that shape for free, and it also keeps a chickadee out of the owl's habit of
 * long crossings.
 */
function pickPerch(sp: Species, from: Perch, rng: () => number): Perch {
  if (rng() < sp.skyOdds) return SKY_PERCH;
  let best = from;
  let bestScore = -1;
  // three candidate draws, best-of — cheap, and it biases toward the near ones
  // without ever making the choice deterministic
  for (let i = 0; i < 3; i++) {
    const cand = sp.perches[Math.floor(rng() * sp.perches.length)];
    if (cand === from) continue;
    const d = cand.pos.distanceTo(from.pos);
    // a soft preference for `reach`, and a floor so it never lands on top of
    // where it already is
    const score = (d < 1.5 ? 0 : Math.exp(-Math.abs(d - sp.reach * 0.55) / sp.reach)) * (0.6 + rng() * 0.8);
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }
  return best === from ? sp.perches[(sp.perches.indexOf(from) + 7) % sp.perches.length] : best;
}

/** lay a flight path between two perches */
function planFlight(b: Bird, sp: Species) {
  const from = b.perch;
  const to = b.next;
  standAt(b.p0, from, b.offset);
  standAt(b.p1, to, b.nextOffset);
  const dist = b.p0.distanceTo(b.p1);

  // OUT: along the way the perch faces, because that is the way the bird is
  // already standing — plus a lift, or a drop off the rail for the owl, which
  // takes the first half-second of altitude out of gravity rather than muscle.
  const outX = Math.sin(from.facing);
  const outZ = Math.cos(from.facing);
  const climb = sp.bound > 0 ? 0.9 : -0.35; // small birds burst up; an owl drops off first
  b.c0
    .copy(b.p0)
    .addScaledVector(new THREE.Vector3(outX, 0, outZ), Math.min(dist * 0.35, sp.reach * 0.5))
    .add(new THREE.Vector3(0, climb + dist * 0.06, 0));

  // IN: from below and in front, so the last stretch is a climb into the perch.
  // The direction is the approach's own heading, not the perch's facing — the
  // bird lands the way it was flying, and shuffles round afterwards.
  const ax = b.p1.x - b.p0.x;
  const az = b.p1.z - b.p0.z;
  const al = Math.hypot(ax, az) || 1;
  b.c1
    .copy(b.p1)
    .addScaledVector(new THREE.Vector3(-ax / al, 0, -az / al), Math.min(dist * 0.32, 3.4))
    .add(new THREE.Vector3(0, -(0.5 + dist * 0.05), 0));

  b.dur = Math.max(0.55, dist / sp.cruise);
  b.t = 0;
  b.mode = 'flight';
}

/**
 * The house's small-bird alarm. One chickadee leaving a shelf is very often the
 * reason the other two leave it: a flock moves as a loose unit, in a ragged
 * sequence rather than in unison. Any departure arms this for a moment, and a
 * bird that is nearly ready to go anyway takes it as its cue.
 */
const flock = { flushUntil: -1 };

/** the perched repertoire, drawn by weight */
function nextAct(sp: Species, rng: () => number, b: Bird): void {
  const r = rng();
  const canHop = b.perch.span > 0.25;
  if (sp.bound > 0) {
    // a chickadee is never still for long: mostly looking and hopping
    if (r < 0.42) b.act = 'watch';
    else if (r < 0.68 && canHop) b.act = 'hop';
    else if (r < 0.84) b.act = 'preen';
    else if (r < 0.93) b.act = 'turn';
    else b.act = 'rouse';
  } else {
    // an owl holds a pose for a long time and then does one deliberate thing
    if (r < 0.46) b.act = 'watch';
    else if (r < 0.66) b.act = 'doze';
    else if (r < 0.8) b.act = 'preen';
    else if (r < 0.9) b.act = 'turn';
    else if (r < 0.96 && canHop) b.act = 'hop';
    else b.act = 'rouse';
  }

  const slow = sp.bound > 0 ? 1 : 2.6;
  switch (b.act) {
    case 'watch': {
      // a SACCADE: snap to a new angle, then hold it. The snap is the damp
      // below running at speed against a target that only ever jumps.
      const steps = [-1.5, -0.9, -0.35, 0, 0.35, 0.9, 1.5, 2.5 * (rng() < 0.5 ? 1 : -1)];
      b.headYawWant = steps[Math.floor(rng() * steps.length)];
      b.headPitchWant = (rng() - 0.35) * 0.5;
      b.timer = (0.5 + rng() * 1.6) * slow;
      break;
    }
    case 'preen':
      // head round into the shoulder, and worry at it
      b.headYawWant = (rng() < 0.5 ? -1 : 1) * (1.9 + rng() * 0.5);
      b.headPitchWant = 0.75;
      b.timer = (1.1 + rng() * 1.8) * slow;
      break;
    case 'rouse':
      b.headYawWant = 0;
      b.headPitchWant = -0.15;
      b.timer = 0.9;
      break;
    case 'turn':
      b.yawWant = b.yaw + (rng() < 0.5 ? Math.PI : -Math.PI) * (0.5 + rng() * 0.5);
      b.headYawWant = 0;
      b.timer = 0.8 + rng() * 0.6;
      break;
    case 'hop': {
      const s = b.perch.span;
      let to = b.offset + (rng() - 0.5) * 2 * Math.min(s, sp.bound > 0 ? 0.5 : 0.35);
      to = THREE.MathUtils.clamp(to, -s, s);
      b.hopFrom = b.offset;
      b.hopTo = to;
      b.hop = 0;
      // face the way you are going to jump, like anything with two feet does
      if (Math.abs(to - b.offset) > 0.04) {
        const dir = Math.sign(to - b.offset);
        b.yawWant = Math.atan2(b.perch.along.x * dir, b.perch.along.z * dir);
      }
      b.timer = 0.34;
      break;
    }
    case 'doze':
      b.headYawWant = (rng() - 0.5) * 0.4;
      b.headPitchWant = 0.1;
      b.timer = 3 + rng() * 6;
      break;
  }
}

/**
 * One bird of either species. The visual is passed in as children so the two
 * models stay declarative and readable, and the refs the animation needs are
 * handed back through `parts`.
 */
interface Parts {
  head: React.RefObject<THREE.Group | null>;
  wingL: React.RefObject<THREE.Group | null>;
  wingR: React.RefObject<THREE.Group | null>;
  body: React.RefObject<THREE.Group | null>;
  tail: React.RefObject<THREE.Group | null>;
  legs: React.RefObject<THREE.Group | null>;
  lids: React.RefObject<THREE.Group | null>;
}

function useBird(sp: Species, seed: number, still: boolean, parts: Parts, root: React.RefObject<THREE.Group | null>) {
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const b = useRef<Bird>(null as unknown as Bird);
  if (b.current === null) {
    const home = sp.perches[Math.floor(rng() * sp.perches.length)];
    b.current = {
      mode: 'perched',
      perch: home,
      offset: (rng() - 0.5) * home.span,
      next: home,
      nextOffset: 0,
      timer: 1 + rng() * 4,
      sat: 0,
      patience: 3,
      t: 0,
      dur: 1,
      act: 'watch',
      hop: -1,
      hopFrom: 0,
      hopTo: 0,
      yaw: home.facing,
      yawWant: home.facing,
      headYaw: 0,
      headYawWant: 0,
      headPitch: 0,
      headPitchWant: 0,
      lid: 0,
      blink: 2 + rng() * 4,
      roll: 0,
      p0: new THREE.Vector3(),
      c0: new THREE.Vector3(),
      c1: new THREE.Vector3(),
      p1: new THREE.Vector3(),
      last: new THREE.Vector3(),
      lastYaw: home.facing,
    };
    standAt(b.current.last, home, b.current.offset);
  }
  const scratch = useMemo(() => ({ p: new THREE.Vector3(), q: new THREE.Vector3() }), []);
  /** how long since departure the flock alarm should last */
  const FLUSH = 1.4;

  useFrame((frame, rawDelta) => {
    const g = root.current;
    if (!g) return;
    const s = b.current;
    const delta = Math.min(rawDelta, 0.05); // a tab that was backgrounded must not teleport a bird
    const t = frame.clock.elapsedTime;

    if (still) {
      standAt(scratch.p, s.perch, s.offset);
      g.position.copy(scratch.p);
      g.rotation.set(0, s.perch.facing, 0);
      g.visible = s.perch.kind !== 'sky';
      if (parts.wingL.current) parts.wingL.current.rotation.z = 0.12;
      if (parts.wingR.current) parts.wingR.current.rotation.z = -0.12;
      return;
    }

    if (s.mode === 'perched') {
      /* ————— standing on something ————— */
      s.timer -= delta;

      // the hop: a real little parabola, feet leaving the timber
      let lift = 0;
      if (s.act === 'hop' && s.hop >= 0) {
        s.hop += delta / 0.3;
        const k = Math.min(s.hop, 1);
        s.offset = THREE.MathUtils.lerp(s.hopFrom, s.hopTo, k);
        lift = Math.sin(k * Math.PI) * (sp.bound > 0 ? 0.07 : 0.05);
        if (k >= 1) s.hop = -1;
      }

      standAt(scratch.p, s.perch, s.offset);
      g.position.set(scratch.p.x, scratch.p.y + lift, scratch.p.z);

      // the body settles toward where it wants to face; a small bird whips
      // round, an owl rotates like a turret
      s.yaw += THREE.MathUtils.clamp(
        ((((s.yawWant - s.yaw) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
        -delta * (sp.bound > 0 ? 9 : 3),
        delta * (sp.bound > 0 ? 9 : 3),
      );
      g.rotation.set(0, s.yaw, 0);

      // roll and wings return to rest
      s.roll = THREE.MathUtils.damp(s.roll, 0, 8, delta);
      const rouse = s.act === 'rouse' ? Math.sin(Math.min(1, 1 - s.timer / 0.9) * Math.PI * 3) * 0.5 : 0;
      const settle = s.act === 'doze' ? -0.04 : 0.1;
      if (parts.wingL.current) parts.wingL.current.rotation.z = settle + rouse;
      if (parts.wingR.current) parts.wingR.current.rotation.z = -settle - rouse;
      if (parts.body.current) {
        // breathing, and the tail-down crouch of a bird about to go
        const ready = s.timer < 0.35 ? (0.35 - s.timer) / 0.35 : 0;
        parts.body.current.rotation.x = ready * 0.22 + Math.sin(t * 1.9 + seed) * 0.012;
        parts.body.current.position.y = -ready * 0.02;
      }
      if (parts.tail.current) {
        // the tail-flick a perched passerine cannot stop doing
        parts.tail.current.rotation.x =
          sp.bound > 0 ? Math.max(0, Math.sin(t * 2.3 + seed * 3)) ** 6 * 0.5 : 0;
      }
      if (parts.legs.current) parts.legs.current.visible = true;

      // blink — and the owl's slow lid, which is half its expression
      s.blink -= delta;
      if (s.blink <= 0) {
        s.lid = 1;
        s.blink = (sp.bound > 0 ? 1.5 : 3) + rng() * (sp.bound > 0 ? 3 : 6);
      }
      const target = s.act === 'doze' ? 0.72 : 0;
      s.lid = THREE.MathUtils.damp(s.lid, target, sp.bound > 0 ? 16 : 7, delta);

      if (s.timer <= 0) {
        // Leaving is a decision made between acts, never mid-preen. Two things
        // prompt it: having sat out the species' patience (`sat` against the
        // rest window), or a flock-mate flushing off the same shelf.
        s.sat += 1;
        const flushed = sp.bound > 0 && t < flock.flushUntil && rng() < 0.5;
        const bored = s.sat >= s.patience;
        if (flushed || bored) {
          s.next = pickPerch(sp, s.perch, rng);
          s.nextOffset = (rng() - 0.5) * s.next.span;
          planFlight(s, sp);
          if (sp.bound > 0) flock.flushUntil = t + FLUSH;
          s.lid = 0;
        } else {
          nextAct(sp, rng, s);
        }
      }

      // the head, damped hard so a new target reads as a snap rather than a pan
      s.headYaw = THREE.MathUtils.damp(s.headYaw, s.headYawWant, sp.bound > 0 ? 22 : 7, delta);
      s.headPitch = THREE.MathUtils.damp(s.headPitch, s.headPitchWant, sp.bound > 0 ? 20 : 7, delta);
      if (parts.head.current) {
        parts.head.current.rotation.y = s.headYaw;
        parts.head.current.rotation.x = s.headPitch + (s.act === 'preen' ? Math.sin(t * 11) * 0.14 : 0);
        // the owl's bobbing parallax stare: it triangulates by moving its head
        parts.head.current.position.x = sp.bound > 0 ? 0 : Math.sin(t * 0.9 + seed) * 0.012;
      }
      if (parts.lids.current) parts.lids.current.scale.y = Math.max(0.001, s.lid);
      return;
    }

    /* ————— in the air ————— */
    s.t += delta / s.dur;
    const k = Math.min(s.t, 1);
    // slow off the mark, decelerating hard into the landing: a bird arrives at
    // a perch at very nearly nothing
    const sm = k * k * (3 - 2 * k);
    const ease = sm * 0.34 + (1 - (1 - k) ** 2.3) * 0.66;
    bez(scratch.p, s.p0, s.c0, s.c1, s.p1, ease);

    // the passerine bound: three beats and a fall, riding on top of the path
    let power = 1;
    if (sp.bound > 0) {
      const cycles = Math.max(2, Math.round((s.dur * 2.6) / 1));
      const ph = k * cycles * Math.PI * 2;
      scratch.p.y += Math.sin(ph) * sp.bound * (1 - k) * 0.9;
      power = Math.sin(ph) > -0.1 ? 1 : 0; // wings shut through the fall
    } else {
      // an owl works to climb and glides everything else
      const rise = scratch.p.y - s.last.y;
      power = k < 0.22 ? 1 : rise > 0.002 ? 0.7 : 0;
    }
    const flare = k > 0.86 ? (k - 0.86) / 0.14 : 0;
    if (flare > 0) power = 0;

    // heading from the actual motion, so the bird always looks where it goes
    scratch.q.copy(scratch.p).sub(s.last);
    if (scratch.q.lengthSq() > 1e-8) {
      const yaw = Math.atan2(scratch.q.x, scratch.q.z);
      let dy = ((yaw - s.lastYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      s.lastYaw = yaw;
      s.yaw = yaw;
      // BANK. Turn rate rolls the bird into the turn; damped, so the roll leads
      // out of one turn and into the next instead of snapping between them.
      dy = THREE.MathUtils.clamp((dy / Math.max(delta, 1e-4)) * 0.16, -0.9, 0.9);
      s.roll = THREE.MathUtils.damp(s.roll, dy, 5, delta);
      const pitch = Math.atan2(scratch.q.y, Math.hypot(scratch.q.x, scratch.q.z));
      g.rotation.set(0, 0, 0);
      g.rotation.order = 'YXZ';
      g.rotation.y = yaw;
      // nose down when diving, and up hard through the flare
      g.rotation.x = -THREE.MathUtils.clamp(pitch, -0.9, 0.7) + flare * 0.85;
      g.rotation.z = s.roll;
    }
    g.position.copy(scratch.p);
    s.last.copy(scratch.p);
    g.visible = true;

    // wings: a beat when working, held out on the glide, cupped and forward
    // through the flare
    const beat = Math.sin(t * sp.beat);
    const open = sp.bound > 0 ? 0.15 : 0.3;
    const wl = parts.wingL.current;
    const wr = parts.wingR.current;
    if (wl && wr) {
      const swing = power > 0 ? open + beat * 0.85 * power : sp.bound > 0 ? -0.85 : 0.02;
      const cup = flare * 1.5;
      wl.rotation.z = swing + cup;
      wr.rotation.z = -swing - cup;
      // the wrists come forward as they cup — that pose IS the landing
      wl.rotation.y = -flare * 0.7;
      wr.rotation.y = flare * 0.7;
    }
    if (parts.body.current) {
      parts.body.current.rotation.x = -flare * 0.25;
      parts.body.current.position.y = 0;
    }
    if (parts.head.current) {
      // the head is a gimbal: it stays level while the body pitches under it
      parts.head.current.rotation.y = THREE.MathUtils.damp(parts.head.current.rotation.y, 0, 10, delta);
      parts.head.current.rotation.x = -g.rotation.x * 0.55;
    }
    if (parts.tail.current) {
      // tail fans and drops as an airbrake in the flare
      parts.tail.current.rotation.x = flare * 0.9;
      parts.tail.current.scale.x = 1 + flare * 0.5;
    }
    // legs are tucked in the cruise and reach for the perch on the way in
    if (parts.legs.current) {
      parts.legs.current.visible = flare > 0.05 || k < 0.12;
      parts.legs.current.rotation.x = -1.2 + flare * 1.4;
    }
    if (parts.lids.current) parts.lids.current.scale.y = 0.001;

    if (s.t >= 1) {
      s.mode = 'perched';
      s.perch = s.next;
      s.offset = s.nextOffset;
      s.yaw = s.lastYaw;
      // gone out of the oculus: sit out of sight for a while
      if (s.perch.kind === 'sky') {
        g.visible = false;
        s.timer = 12 + rng() * 18;
        s.act = 'doze';
      } else {
        // landed, then shuffle round to face the way the perch faces — the
        // small settling turn that follows every real landing
        s.yawWant = s.perch.facing + (rng() - 0.5) * 0.7;
        s.sat = 0;
        // how many small acts this bird will get through before it wants to be
        // somewhere else — drawn per perch, so no two stays are the same length
        s.patience = Math.max(1, Math.round((sp.rest[0] + rng() * sp.rest[1]) / (sp.bound > 0 ? 2.6 : 7)));
        nextAct(sp, rng, s);
        s.timer = Math.max(s.timer, 0.5) + sp.rest[0] * 0.25;
      }
      s.roll = 0;
      g.rotation.set(0, s.yaw, 0);
    }
  });
}

/** the refs one bird model has to expose */
function useParts(): Parts {
  return {
    head: useRef<THREE.Group>(null),
    wingL: useRef<THREE.Group>(null),
    wingR: useRef<THREE.Group>(null),
    body: useRef<THREE.Group>(null),
    tail: useRef<THREE.Group>(null),
    legs: useRef<THREE.Group>(null),
    lids: useRef<THREE.Group>(null),
  };
}

/* ————— the owl ————— */

const OWL: Species = {
  perches: perchesFor('owl'),
  cruise: 4.6, // an owl crosses a room unhurriedly and almost silently
  beat: 15,
  rest: [14, 26],
  bound: 0,
  reach: 16,
  skyOdds: 0,
};

export function Owl({ still }: { still: boolean }) {
  const root = useRef<THREE.Group>(null);
  const parts = useParts();
  useBird(OWL, 2026, still, parts, root);

  return (
    <group ref={root}>
      <group ref={parts.body}>
        {/* body */}
        <mesh position={[0, 0.16, 0]} scale={[1, 1.25, 0.9]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#6b4d33" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.14, 0.08]} scale={[0.8, 1.1, 0.6]}>
          <sphereGeometry args={[0.11, 10, 8]} />
          <meshStandardMaterial color="#c9b294" roughness={0.85} />
        </mesh>
        {/* wings — grouped now, so the shoulder can swing and the wrist can
            come forward through a landing flare */}
        <group ref={parts.wingL} position={[-0.11, 0.2, 0]} rotation-z={0.12}>
          <mesh position={[-0.02, 0, 0]} scale={[0.35, 1, 0.8]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#57402a" roughness={0.8} />
          </mesh>
          {/* the primaries: the long slotted hand of a hunting owl */}
          <mesh position={[-0.12, -0.02, -0.03]} rotation-z={0.35} scale={[1, 0.28, 0.5]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshStandardMaterial color="#4a3624" roughness={0.85} />
          </mesh>
        </group>
        <group ref={parts.wingR} position={[0.11, 0.2, 0]} rotation-z={-0.12}>
          <mesh position={[0.02, 0, 0]} scale={[0.35, 1, 0.8]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#57402a" roughness={0.8} />
          </mesh>
          <mesh position={[0.12, -0.02, -0.03]} rotation-z={-0.35} scale={[1, 0.28, 0.5]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshStandardMaterial color="#4a3624" roughness={0.85} />
          </mesh>
        </group>
        {/* tail */}
        <group ref={parts.tail} position={[0, 0.06, -0.13]}>
          <mesh rotation-x={-0.35} position={[0, -0.02, -0.08]} scale={[0.7, 0.14, 1]}>
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshStandardMaterial color="#5b4229" roughness={0.85} />
          </mesh>
        </group>
        {/* feet — only shown on take-off and landing, but they are what makes
            a flare read as a flare */}
        <group ref={parts.legs} position={[0, 0.02, 0.01]} visible>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.05, 0, 0]}>
              <mesh position={[0, -0.03, 0]}>
                <cylinderGeometry args={[0.014, 0.012, 0.07, 5]} />
                <meshStandardMaterial color="#c9a86e" roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.065, 0.015]} rotation-x={0.5}>
                <coneGeometry args={[0.018, 0.05, 5]} />
                <meshStandardMaterial color="#3a2c1c" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
        {/* head */}
        <group ref={parts.head} position={[0, 0.38, 0]}>
          <mesh>
            <sphereGeometry args={[0.115, 12, 10]} />
            <meshStandardMaterial color="#7a5a3c" roughness={0.8} />
          </mesh>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.05, 0.02, 0.09]}>
                <sphereGeometry args={[0.032, 8, 6]} />
                <meshStandardMaterial color="#f5edda" roughness={0.4} />
              </mesh>
              <mesh position={[s * 0.05, 0.02, 0.115]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshStandardMaterial color="#1a130c" roughness={0.3} />
              </mesh>
              <mesh position={[s * 0.075, 0.1, 0]} rotation-z={s * -0.4}>
                <coneGeometry args={[0.025, 0.07, 6]} />
                <meshStandardMaterial color="#57402a" roughness={0.8} />
              </mesh>
            </group>
          ))}
          {/* the lids: two feathered discs that close DOWN over the eyes. An
              owl's slow blink is most of what makes it read as awake. */}
          <group ref={parts.lids} position={[0, 0.055, 0.098]} scale-y={0.001}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.05, -0.018, 0]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.035, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#77573a" roughness={0.85} />
              </mesh>
            ))}
          </group>
          <mesh position={[0, -0.02, 0.11]} rotation-x={Math.PI / 2}>
            <coneGeometry args={[0.02, 0.05, 6]} />
            <meshStandardMaterial color="#d8a13c" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ————— chickadees: quick little visitors that work the stacks in a loose
   party, and now and then leave through the oculus altogether ————— */

const CHICKADEE: Species = {
  perches: perchesFor('small'),
  // a small bird's flight is FAST and short; nothing about it is unhurried
  cruise: 7.4,
  beat: 34,
  rest: [6, 10],
  // the passerine bound: the wings shut between bursts and the bird falls,
  // which is the undulating line everyone recognises from a garden
  bound: 0.32,
  reach: 7,
  skyOdds: 0.07,
};

function Chickadee({ seed, still }: { seed: number; still: boolean }) {
  const root = useRef<THREE.Group>(null);
  const parts = useParts();
  useBird(CHICKADEE, seed, still, parts, root);

  return (
    <group ref={root} scale={0.55}>
      <group ref={parts.body}>
        <mesh scale={[0.9, 1, 1.25]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#8a8a84" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0.1]} scale={[0.8, 0.9, 0.8]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#efe8d8" roughness={0.8} />
        </mesh>
        <group ref={parts.wingL} position={[-0.06, 0.02, -0.01]} rotation-z={0.3}>
          <mesh position={[-0.03, 0, 0]} scale={[0.5, 0.16, 1]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <meshStandardMaterial color="#6e6e68" roughness={0.8} />
          </mesh>
        </group>
        <group ref={parts.wingR} position={[0.06, 0.02, -0.01]} rotation-z={-0.3}>
          <mesh position={[0.03, 0, 0]} scale={[0.5, 0.16, 1]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <meshStandardMaterial color="#6e6e68" roughness={0.8} />
          </mesh>
        </group>
        {/* tail — long for the body, and never still on a perch */}
        <group ref={parts.tail} position={[0, 0.01, -0.09]}>
          <mesh position={[0, 0, -0.05]} rotation-x={-0.5} scale={[0.35, 0.1, 1]}>
            <sphereGeometry args={[0.09, 6, 6]} />
            <meshStandardMaterial color="#55554f" roughness={0.8} />
          </mesh>
        </group>
        <group ref={parts.legs} position={[0, -0.05, 0.01]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.03, -0.02, 0]}>
              <cylinderGeometry args={[0.006, 0.005, 0.05, 4]} />
              <meshStandardMaterial color="#3a3128" roughness={0.8} />
            </mesh>
          ))}
        </group>
        {/* head: black cap and bib, and the bill it forages with */}
        <group ref={parts.head} position={[0, 0.04, 0.05]}>
          <mesh position={[0, 0.05, 0.01]}>
            <sphereGeometry args={[0.055, 8, 6]} />
            <meshStandardMaterial color="#1f1c1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0.065]} rotation-x={Math.PI / 2}>
            <coneGeometry args={[0.012, 0.04, 5]} />
            <meshStandardMaterial color="#2a2118" roughness={0.5} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.035, 0.062, 0.032]}>
              <sphereGeometry args={[0.009, 6, 5]} />
              <meshStandardMaterial color="#0d0b09" roughness={0.3} />
            </mesh>
          ))}
          <group ref={parts.lids} scale-y={0.001} />
        </group>
      </group>
    </group>
  );
}

/**
 * The party. Three is enough to read as a flock and few enough that they never
 * merge into a swarm — and because they share the `flock` alarm, one leaving
 * pulls the others off the same shelf a beat later, which is the behaviour that
 * makes three separate birds look like one group of birds.
 */
export function Chickadees({ still }: { still: boolean }) {
  return (
    <group>
      <Chickadee seed={301} still={still} />
      <Chickadee seed={407} still={still} />
      <Chickadee seed={513} still={still} />
    </group>
  );
}
