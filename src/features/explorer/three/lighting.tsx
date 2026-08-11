import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PALETTE } from '../../../materials';
import { DustMotes } from './DustMotes';
import { OCULUS_R, ROT_DOME_TOP } from './layout';

/**
 * The lighting rig.
 *
 * What was here was `ambientLight 0.68` plus `hemisphereLight 0.82` — 1.5 units
 * of flat, directionless fill laid over the whole building. That pair is the
 * single reason the museum read as evenly-lit brown at every distance: an
 * ambient term cannot model anything. It raises the darkest surface and the
 * brightest surface by the same amount, so nothing anywhere gets a lit side and
 * a shadow side, and a 46 m hall looks exactly as deep as a broom cupboard.
 *
 * It is replaced by four things that each do a job:
 *
 *   MOONLIGHT   one cool directional, raking down and across. This is what
 *               gives every moulding, rib and statue a lit face and a dark one.
 *   OCULUS      a hard silver shaft dropping through the eye of the dome onto
 *               the rotunda floor. The building's signature light, and the only
 *               thing in it that comes from outside.
 *   BOUNCE      a very low hemisphere — cold sky above, warm timber below —
 *               standing in for the light the floor throws back up. This is the
 *               only ambient term left, and it is a twelfth of what it was.
 *   PRACTICALS  candles, lamps, hearth, chandeliers. Owned elsewhere; this
 *               file just leaves room for them.
 *
 * The target is the budget in `palette.ts`: roughly 85% shadow, 10% warm
 * practical light, 5% anything self-luminous. Dark is the point. Unlit CONTENT
 * is not — every reading station keeps a practical within reach of it.
 */

/** Where the moon sits. High and behind-left, so the drum's piers throw their
 *  shadows across the floor toward the visitor rather than away from them. */
const MOON_DIR: [number, number, number] = [-26, 38, -20];

export function LibraryLighting({ still }: { still: boolean }) {
  const shaft = useRef<THREE.SpotLight>(null);

  // the shaft's target has to be an object in the scene for three to aim at it
  const shaftTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, 0);
    return o;
  }, []);

  useFrame((state) => {
    if (still || !shaft.current) return;
    // The moon is not steady. A very slow breath on the shaft — three seconds
    // to a cycle, ±4% — is below the threshold where it reads as a flicker and
    // above the one where the room reads as a still frame.
    shaft.current.intensity = 1.7 + Math.sin(state.clock.elapsedTime * 0.21) * 0.08;
  });

  return (
    <group>
      {/* ————— moonlight ————— */}
      {/* No shadow map. Eight halls, four hundred shelves and a coffered dome
          is far too much geometry to shadow-cast at any usable resolution, and
          a low-res cascade over this much depth reads as dirt on the lens. The
          modelling comes from the direction of the light instead. */}
      {/* Cut from 1.34 to 0.3. A directional has no falloff — it reaches every
          surface in the building equally, which is exactly what "the moon lights
          the whole map" means. It is now a modelling term only: enough to tell
          a lit face from a shadowed one, nowhere near enough to READ by. What
          the moon actually lights is the pool under the oculus, below, and the
          bays under the wing windows; everything else is on the practicals. */}
      <directionalLight position={MOON_DIR} color={PALETTE.moonlitSilver} intensity={0.42} />
      {/* the counter-light, down from 0.26: shadow faces keep a trace of blue
          so carving still resolves, but they are close to black now */}
      <directionalLight position={[24, 14, 22]} color={PALETTE.midnightBlue} intensity={0.15} />

      {/* ————— the oculus shaft ————— */}
      <primitive object={shaftTarget} />
      <spotLight
        ref={shaft}
        position={[0, ROT_DOME_TOP + 1.5, 0]}
        target={shaftTarget}
        color={PALETTE.moonlitSilver}
        intensity={1.7}
        // wide enough that the pool on the floor is a little larger than the
        // oculus itself, which is what moonlight through a hole 29 m up does
        angle={Math.atan((OCULUS_R * 2.1) / ROT_DOME_TOP)}
        penumbra={0.85}
        // decay 0 on purpose: this is a shaft, not a bulb. With physical
        // falloff over 29 m it arrives at the floor as nothing.
        decay={0}
        distance={0}
      />

      {/* ————— bounce ————— */}
      {/* Cold from the sky, warm from the timber floor. 0.17 against the 1.5
          that used to be here.

          Cut again from 0.26 as the budget moved to 80/15/5: this is the term
          that decides how much of the building the eye is GIVEN rather than has
          to find, and every unit of it is a metre of hall that stops being worth
          walking into. It is now doing one job only — keeping the deepest
          corners off pure black, so architecture recedes into darkness instead
          of ending at it. */}
      <hemisphereLight args={[PALETTE.midnightBlue, PALETTE.blackWalnut, 0.095]} />
      {/* The last flat term in the building. It exists only so that a surface
          facing directly away from every source still resolves as a surface.
          Cooler than the fill above it, because a shadow that stays blue reads
          as night and a shadow that goes grey reads as underexposure. */}
      <ambientLight intensity={0.058} color={PALETTE.moonlitSilver} />

      {/* ————— the dome wash —————
          The one light in this file added for a single surface, and it is worth
          its ~1.5 fps because without it the dome does not exist.

          The problem it solves: the shell's inner face is `BackSide`, faces down
          and inward, and the moon is outside the building — so it receives
          nothing. Its coffers were repainted with lapis fields and gilt
          engraving and NONE of it rendered; the most worked surface in the
          museum was a black cap with a star chart floating under it. A vertex
          bake could not rescue it either, because vertex colour multiplies
          albedo and multiplying an unlit surface by anything is still unlit.

          Physically this is the floor bounce: moonlight comes down the shaft,
          lands on the boards, and goes back up into the shell. So it is cool,
          it sits high on the axis where the drum head is, and it falls off
          before it reaches the floor it is supposedly coming from — which is a
          cheat, but the alternative is lighting the Cosmographia twice.

          The shaping is done in `domeGeom`'s vertex bake (structure.tsx): this
          light supplies the energy, that supplies the gradient. */}
      <pointLight
        position={[0, 15.5, 0]}
        color={PALETTE.moonlitSilver}
        intensity={26}
        distance={22}
        decay={1.5}
      />

      {/* ————— what makes the light visible ————— */}
      {/* A beam you cannot see is just a bright patch on the floor. Two dust
          fields, and they are doing different jobs:

          IN THE SHAFT   a narrow column of cold motes standing in the oculus
                         light, from the floor to the eye of the dome. This is
                         the one that reads as a shaft rather than a spotlight.
          IN THE ROOM    a broad, much fainter warm field at head height, so the
                         candle pools have something to hang in and the air
                         itself reads as old.

          Both drift almost imperceptibly and both freeze under reduced motion. */}
      <DustMotes
        count={110}
        radius={5.5}
        height={ROT_DOME_TOP}
        color={PALETTE.moonlitSilver}
        size={0.34}
        opacity={0.22}
        still={still}
      />
      <DustMotes
        count={340}
        radius={30}
        height={11}
        color={PALETTE.candleGold}
        size={0.34}
        opacity={0.5}
        still={still}
      />

      {/* ————— the hearth end ————— */}
      {/* the one warm practical that belongs to the room rather than to a
          fixture: the fire at the entrance end, throwing amber up the runner */}
      <pointLight
        position={[0, 6, 12]}
        color={PALETTE.candleGold}
        intensity={34}
        distance={24}
        decay={1.9}
      />
    </group>
  );
}
