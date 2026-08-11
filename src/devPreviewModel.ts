/**
 * Scratch harness for looking at a statue GLB on its own, at a size and under
 * lighting where the paint can actually be judged. Not part of the app — reached
 * only at /preview-model.html?src=/models/hermes.glb. Delete when the statuary
 * repaint is finished.
 *
 * Four turns of the same model in a 2×2 grid under one orthographic camera:
 * front, right, back, left. Orthographic so a region's apparent size is the same
 * in every cell and boundaries can be read off against the others.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const params = new URLSearchParams(location.search);
const src = params.get('src') ?? '/models/hermes.glb';

const W = window.innerWidth;
const H = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.setClearColor('#2a2622');
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight('#fff4e2', '#4a3f33', 2.0));
const key = new THREE.DirectionalLight('#fff0d8', 2.2);
key.position.set(4, 7, 8);
scene.add(key);
const fill = new THREE.DirectionalLight('#cfe0ff', 0.9);
fill.position.set(-5, 2, 4);
scene.add(fill);

const HALF_W = 5.4;
const camera = new THREE.OrthographicCamera(-HALF_W, HALF_W, (HALF_W * H) / W, -(HALF_W * H) / W, -50, 50);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

new GLTFLoader().load(src, (gltf) => {
  const root = gltf.scene;
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const mid = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(mid);
  const s = 4 / size.y;

  const CELLS: [number, number][] = [
    [-2.6, 2.4],
    [2.6, 2.4],
    [-2.6, -2.4],
    [2.6, -2.4],
  ];
  CELLS.forEach(([cx, cy], i) => {
    const holder = new THREE.Group();
    holder.position.set(cx, cy, 0);
    const spin = new THREE.Group();
    spin.rotation.y = (i / CELLS.length) * Math.PI * 2;
    const clone = root.clone(true);
    clone.scale.setScalar(s);
    clone.position.set(-mid.x * s, -mid.y * s, -mid.z * s);
    spin.add(clone);
    holder.add(spin);
    scene.add(holder);
  });

  renderer.render(scene, camera);
  document.title = 'ready';
});
