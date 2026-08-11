/**
 * The solar system, for the orrery turning under the dome.
 *
 * These are the real mean orbital elements at epoch J2000.0 (2000 Jan 1.5 TT),
 * the standard Standish/JPL set used for low-precision ephemerides. Angles are
 * degrees, distances AU, periods days, radii kilometres.
 *
 * What the orrery keeps true:
 *   · the order of the planets, and their relative sizes
 *   · each orbit's eccentricity — so Mercury's ellipse really is lopsided and
 *     every planet really does run faster at perihelion (Kepler's second law)
 *   · each orbit's inclination and ascending node, so the orbital planes fan
 *     out from the ecliptic exactly as they do
 *   · the ratios between orbital periods — a Jovian year really is 11.86
 *     terrestrial ones
 *   · where each planet stood at J2000, from its mean longitude
 *
 * What it cannot keep true, and why:
 *   · absolute orbital RADII. Neptune orbits 78× further out than Mercury; at
 *     any scale that fits Neptune under a 17 m dome, Mercury would be a
 *     millimetre from the centre. Radii are therefore compressed by a power
 *     law (see ORBIT_MIN/ORBIT_MAX in Orrery.tsx), which preserves the ORDER
 *     and keeps every orbit legible. Each ellipse is still the right shape for
 *     its own semi-major axis.
 *   · absolute planet sizes, compressed the same way and for the same reason.
 *
 * These are heliocentric elements and the orrery draws them heliocentrically:
 * the Sun holds the middle and all eight planets, the Earth among them, run
 * their own orbits around him. An earlier build put the Earth at the centre
 * and skipped it from the orbits; that was a deliberate nod to the Ptolemaic
 * cosmos the library's traditions were written inside, but it left the Earth
 * reading as a different kind of object from the bodies sharing its chart.
 * See the note at the top of Orrery.tsx.
 */

export interface Planet {
  name: string;
  /** semi-major axis, AU */
  a: number;
  /** eccentricity */
  e: number;
  /** inclination to the ecliptic, degrees */
  i: number;
  /** longitude of the ascending node, degrees */
  node: number;
  /** longitude of perihelion (ϖ = node + argument of perihelion), degrees */
  peri: number;
  /** mean longitude at J2000, degrees — where the planet actually stood */
  L0: number;
  /** sidereal orbital period, days */
  period: number;
  /** equatorial radius, km */
  radius: number;
  /** the colour it shows to the eye */
  color: string;
}

export const PLANETS: readonly Planet[] = [
  {
    name: 'Mercury',
    a: 0.38709927, e: 0.20563593, i: 7.00497902,
    node: 48.33076593, peri: 77.45779628, L0: 252.25032350,
    period: 87.9691, radius: 2439.7, color: '#8c8378',
  },
  {
    name: 'Venus',
    a: 0.72333566, e: 0.00677672, i: 3.39467605,
    node: 76.67984255, peri: 131.60246718, L0: 181.97909950,
    period: 224.701, radius: 6051.8, color: '#e3cfa0',
  },
  {
    name: 'Earth',
    a: 1.00000261, e: 0.01671123, i: 0.0,
    node: 0.0, peri: 102.93768193, L0: 100.46457166,
    period: 365.256, radius: 6371.0, color: '#4a7fb5',
  },
  {
    name: 'Mars',
    a: 1.52371034, e: 0.09339410, i: 1.84969142,
    node: 49.55953891, peri: -23.94362959, L0: -4.55343205,
    period: 686.980, radius: 3389.5, color: '#b5563a',
  },
  {
    name: 'Jupiter',
    a: 5.20288700, e: 0.04838624, i: 1.30439695,
    node: 100.47390909, peri: 14.72847983, L0: 34.39644051,
    period: 4332.589, radius: 69911, color: '#cbab7e',
  },
  {
    name: 'Saturn',
    a: 9.53667594, e: 0.05386179, i: 2.48599187,
    node: 113.66242448, peri: 92.59887831, L0: 49.95424423,
    period: 10759.22, radius: 58232, color: '#e0c68a',
  },
  {
    name: 'Uranus',
    a: 19.18916464, e: 0.04725744, i: 0.77263783,
    node: 74.01692503, peri: 170.95427630, L0: 313.23810451,
    period: 30685.4, radius: 25362, color: '#a8d8e0',
  },
  {
    name: 'Neptune',
    a: 30.06992276, e: 0.00859048, i: 1.77004347,
    node: 131.78422574, peri: 44.96476227, L0: -55.12002969,
    period: 60189, radius: 24622, color: '#3f66b5',
  },
];

/** Saturn's rings, in units of Saturn's own equatorial radius: the inner edge
 *  of the D ring out to the outer edge of the A ring. */
export const SATURN_RING = { inner: 1.11, outer: 2.27 };

/**
 * Obliquity — the tilt of each body's own axis to its orbital plane, degrees.
 * Worth drawing because the tilts are visibly different from one another and
 * from anything a viewer would guess: Jupiter stands almost perfectly upright,
 * and Uranus lies on his side, rolling around the sun like a dropped hoop.
 */
export const AXIAL_TILT_DEG: Record<string, number> = {
  Sun: 7.25, // the solar equator's tilt to the ecliptic
  Mercury: 0.03,
  Venus: 177.36, // retrograde — Venus turns backwards, so her pole points down
  Earth: 23.44,
  Mars: 25.19,
  Jupiter: 3.13,
  Saturn: 26.73,
  Uranus: 97.77, // on its side
  Neptune: 28.32,
};

/** Saturn's axial tilt in degrees — the rings lie in its equatorial plane */
export const SATURN_TILT = AXIAL_TILT_DEG.Saturn;

/**
 * Solve Kepler's equation M = E − e·sin E for the eccentric anomaly, by
 * Newton–Raphson. Converges in a handful of steps for every planetary
 * eccentricity here (the worst is Mercury's 0.206).
 */
export function eccentricAnomaly(meanAnomaly: number, e: number): number {
  // wrap to [−π, π] so the first guess is always close
  let m = meanAnomaly % (Math.PI * 2);
  if (m > Math.PI) m -= Math.PI * 2;
  if (m < -Math.PI) m += Math.PI * 2;
  let E = m + e * Math.sin(m);
  for (let k = 0; k < 8; k++) {
    const d = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-10) break;
  }
  return E;
}

const RAD = Math.PI / 180;

/**
 * Position of a planet in its orbit, in the ecliptic frame, for a given
 * eccentric anomaly.
 *
 * `scale` maps a true heliocentric distance in AU to a scene radius. It is
 * applied to the INSTANTANEOUS distance, not to the semi-major axis, and that
 * detail matters: because the map is monotonic, two orbits that never overlap
 * in reality can never overlap in the scene either. Compressing the axis alone
 * and then applying the raw eccentricity would leave Mercury's aphelion
 * reaching past Venus's perihelion — a crossing that does not exist in the
 * sky. Squeezing the whole orbit through one monotonic function keeps the
 * nesting honest, at the cost of flattening each ellipse a little.
 *
 * Returns [x, y, z] ready for three.js: the ecliptic plane is the scene's
 * x/z plane and y is ecliptic north, so the orbits lie flat under the dome
 * with each plane's true inclination lifting it off the horizontal.
 */
export function orbitalPosition(
  p: Planet,
  E: number,
  scale: (auRadius: number) => number,
): [number, number, number] {
  const e = p.e;
  // true anomaly from the eccentric anomaly, and the real distance in AU
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = scale(p.a * (1 - e * Math.cos(E)));
  // argument of latitude: perihelion is measured from the node
  const u = (p.peri - p.node) * RAD + nu;
  const node = p.node * RAD;
  const inc = p.i * RAD;
  const cu = Math.cos(u);
  const su = Math.sin(u);
  const X = r * (Math.cos(node) * cu - Math.sin(node) * su * Math.cos(inc));
  const Y = r * (Math.sin(node) * cu + Math.cos(node) * su * Math.cos(inc));
  const Z = r * (su * Math.sin(inc));
  // ecliptic (X, Y) → scene (x, z); ecliptic north → scene up
  return [X, Z, Y];
}

/** mean anomaly at J2000 — where the planet was when the epoch was struck */
export function meanAnomalyAtEpoch(p: Planet): number {
  return (p.L0 - p.peri) * RAD;
}
