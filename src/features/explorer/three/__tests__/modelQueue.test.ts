import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  modelsInFlight,
  pumpModelQueue,
  registerModelSlot,
  reportModelReady,
  resetModelQueue,
  unregisterModelSlot,
} from '../modelQueue';

/**
 * The gate in front of the sculpted figures.
 *
 * Worth a test rather than an eyeball because every symptom of it being wrong
 * looks exactly like the connection being slow: the queue over-admitting is
 * invisible on a desk, on localhost, and in any environment where a megabyte
 * arrives instantly. The first version of the hook handed each slot straight
 * back on the tick it was granted and all thirteen figures went out at once —
 * which is the behaviour this file exists to prevent — and nothing on screen
 * looked any different.
 */

/** the phone's cap, pinned here rather than imported: a test in Node reports
 *  as a desktop, where the queue deliberately does not gate at all */
const CAP = 2;

/** a camera somewhere on the floor, looking down −z unless told otherwise */
function cameraAt(x: number, z: number, lookX = x, lookZ = z - 1): THREE.Camera {
  const cam = new THREE.PerspectiveCamera();
  cam.position.set(x, 1.7, z);
  cam.lookAt(lookX, 1.7, lookZ);
  cam.updateMatrixWorld(true);
  return cam;
}

function register(id: string, x: number, z: number): string[] {
  const woken: string[] = [];
  registerModelSlot(id, x, 0, z, () => woken.push(id));
  return woken;
}

describe('the sculpted-figure download queue', () => {
  beforeEach(() => resetModelQueue());

  it('never lets more than CAP figures download at once', () => {
    for (let i = 0; i < 13; i++) register(`fig${i}`, i * 3, -10);
    pumpModelQueue(cameraAt(0, 0), CAP);
    expect(modelsInFlight()).toBe(CAP);
  });

  it('does not admit anyone new until an admitted figure arrives', () => {
    const woken: string[] = [];
    for (let i = 0; i < 6; i++) registerModelSlot(`fig${i}`, i * 3, 0, -10, () => woken.push(`fig${i}`));

    pumpModelQueue(cameraAt(0, 0), CAP);
    const first = [...woken];
    expect(first).toHaveLength(CAP);

    // pumping again changes nothing while the slots are still held
    pumpModelQueue(cameraAt(0, 0), CAP);
    pumpModelQueue(cameraAt(0, 0), CAP);
    expect(woken).toEqual(first);

    // one lands, so exactly one more is let through
    reportModelReady(first[0]);
    pumpModelQueue(cameraAt(0, 0), CAP);
    expect(woken).toHaveLength(CAP + 1);
  });

  it('gives the connection to what the visitor is looking at, not to what is nearest', () => {
    const woken: string[] = [];
    // four metres behind the camera, against one four times further away but
    // dead ahead — the librarian-down-the-axis case
    registerModelSlot('behind', 0, 0, 4, () => woken.push('behind'));
    registerModelSlot('ahead', 0, 0, -16, () => woken.push('ahead'));

    pumpModelQueue(cameraAt(0, 0), 1); // standing at the origin, facing −z
    expect(woken).toEqual(['ahead']);
  });

  it('orders the figures you can see by how near they are', () => {
    const woken: string[] = [];
    registerModelSlot('far', 0, 0, -30, () => woken.push('far'));
    registerModelSlot('near', 0, 0, -6, () => woken.push('near'));
    registerModelSlot('mid', 0, 0, -14, () => woken.push('mid'));

    pumpModelQueue(cameraAt(0, 0), 3);
    expect(woken).toEqual(['near', 'mid', 'far']);
  });

  it('takes a slot back when a figure unmounts before it ever arrives', () => {
    const woken: string[] = [];
    for (let i = 0; i < 4; i++) registerModelSlot(`fig${i}`, i, 0, -10, () => woken.push(`fig${i}`));
    pumpModelQueue(cameraAt(0, 0), CAP);
    expect(modelsInFlight()).toBe(CAP);

    unregisterModelSlot(woken[0]);
    expect(modelsInFlight()).toBe(CAP - 1);
  });

  it('counts a release once, however many times it is reported', () => {
    register('only', 0, -10);
    pumpModelQueue(cameraAt(0, 0), CAP);
    expect(modelsInFlight()).toBe(1);

    reportModelReady('only');
    reportModelReady('only');
    unregisterModelSlot('only');
    expect(modelsInFlight()).toBe(0);
  });
});
