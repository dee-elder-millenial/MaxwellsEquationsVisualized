import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#maxwell-canvas');
const strengthSlider = document.querySelector('#charge-strength');
const readout = document.querySelector('#charge-readout');
const surfaceToggle = document.querySelector('#show-surface');
const fieldToggle = document.querySelector('#show-arrows');
const animateToggle = document.querySelector('#animate-field');
const tabs = [...document.querySelectorAll('.equation-tab')];

const setText = (selector, value, asHtml = false) => {
  const el = document.querySelector(selector);
  if (asHtml) el.innerHTML = value;
  else el.textContent = value;
};

function showMagnetismText() {
  setText('#scene-badge', "Gauss's Law for Magnetism");
  setText('#scene-status', 'Interactive scene');
  setText('#scene-title', 'Magnetic field lines always close.');
  setText('#scene-intro', 'A bar magnet bends the magnetic field into bright closed loops. The transparent sphere shows that magnetic field enters and leaves in equal measure.');
  setText('#equation-label', 'Differential form');
  setText('#equation', '∇ · <strong>B</strong> = 0', true);
  setText('#equation-summary', 'There are no isolated magnetic sources or sinks. The net magnetic flux through any closed surface is zero.');
  setText('#lesson-title', 'What you are seeing');
  setText('#lesson-copy', 'The glowing loops leave the north pole, curve around, and return to the south pole. They cross the Gaussian surface both ways, so the total magnetic flux cancels.');
  document.querySelector('#placeholder-card').hidden = true;
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.scene === 'gaussMagnetic'));
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x040716, 0.045);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(5.2, 3.4, 6.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.22;
controls.minDistance = 4;
controls.maxDistance = 13;

scene.add(new THREE.AmbientLight(0xa8c8ff, 1.15));
const cyanLight = new THREE.PointLight(0x66ddff, 95, 18);
cyanLight.position.set(4, 4, 4);
scene.add(cyanLight);
const redLight = new THREE.PointLight(0xff6688, 55, 15);
redLight.position.set(-4, -2, 3);
scene.add(redLight);

const root = new THREE.Group();
scene.add(root);

const grid = new THREE.GridHelper(12, 24, 0x1a7fa5, 0x17324a);
grid.position.y = -2.55;
grid.material.transparent = true;
grid.material.opacity = 0.12;
root.add(grid);

const starPositions = new Float32Array(500 * 3);
for (let i = 0; i < 500; i += 1) {
  const radius = THREE.MathUtils.randFloat(15, 36);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
  starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * Math.cos(phi);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xcfeaff, size: 0.025, transparent: true, opacity: 0.55 })));

function makeLabel(text, color, scale = 1) {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 180;
  const ctx = labelCanvas.getContext('2d');
  ctx.font = '900 64px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 90);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(labelCanvas),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  sprite.scale.set(1.25 * scale, 0.46 * scale, 1);
  return sprite;
}

const magnet = new THREE.Group();
const north = new THREE.Mesh(
  new THREE.BoxGeometry(1.75, 0.82, 0.82),
  new THREE.MeshStandardMaterial({ color: 0xff486d, emissive: 0x8a1330, emissiveIntensity: 0.95, metalness: 0.34, roughness: 0.18 }),
);
north.position.x = 0.88;
const south = new THREE.Mesh(
  new THREE.BoxGeometry(1.75, 0.82, 0.82),
  new THREE.MeshStandardMaterial({ color: 0x4ddfff, emissive: 0x125d78, emissiveIntensity: 0.95, metalness: 0.34, roughness: 0.18 }),
);
south.position.x = -0.88;
const seam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
magnet.add(north, south, seam);
const nLabel = makeLabel('N', '#ff9aae', 0.9);
nLabel.position.set(1.82, 0.82, 0.02);
const sLabel = makeLabel('S', '#9aefff', 0.9);
sLabel.position.set(-1.82, 0.82, 0.02);
magnet.add(nLabel, sLabel);
root.add(magnet);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.75, 72, 48),
  new THREE.MeshPhysicalMaterial({ color: 0x9d7cff, transparent: true, opacity: 0.055, transmission: 0.2, thickness: 0.3, side: THREE.DoubleSide }),
);
const sphereWire = new THREE.Mesh(
  new THREE.SphereGeometry(2.77, 32, 20),
  new THREE.MeshBasicMaterial({ color: 0xb785ff, wireframe: true, transparent: true, opacity: 0.09 }),
);
root.add(sphere, sphereWire);

const zeroFlux = makeLabel('NET FLUX = 0', '#fff2a8', 1.45);
zeroFlux.position.set(0, -2.05, 0);
root.add(zeroFlux);

const fieldLines = new THREE.Group();
const movingDots = new THREE.Group();
const directionArrows = new THREE.Group();
root.add(fieldLines, movingDots, directionArrows);

const purple = new THREE.Color(0xb785ff);
const gold = new THREE.Color(0xffd166);
const white = new THREE.Color(0xffffff);
const curves = [];

function makeLoop(height, zOffset, side) {
  const points = [];
  for (let i = 0; i <= 90; i += 1) {
    const u = i / 90;
    const x = THREE.MathUtils.lerp(1.58, -1.58, u);
    const y = side * height * Math.sin(Math.PI * u);
    const z = zOffset + 0.2 * Math.sin(Math.PI * u) * Math.sin(Math.PI * 2 * u);
    points.push(new THREE.Vector3(x, y, z));
  }
  for (let i = 0; i <= 90; i += 1) {
    const u = i / 90;
    const x = THREE.MathUtils.lerp(-1.58, 1.58, u);
    const y = -side * 0.28 * Math.sin(Math.PI * u);
    const z = zOffset * 0.28;
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.55);
}

[-0.95, -0.48, 0, 0.48, 0.95].forEach((zOffset) => {
  [1.05, 1.48, 1.92].forEach((height, heightIndex) => {
    [-1, 1].forEach((side) => {
      const curve = makeLoop(height, zOffset, side);
      curves.push(curve);
      const color = side > 0 ? 0xb785ff : 0xffd166;
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 180, 0.035 + heightIndex * 0.006, 12, true),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending }),
      );
      fieldLines.add(tube);
      [0.18, 0.48, 0.78].forEach((spot) => {
        const arrow = new THREE.ArrowHelper(curve.getTangentAt(spot), curve.getPointAt(spot), 0.42, color, 0.15, 0.1);
        arrow.userData.curve = curve;
        arrow.userData.spot = spot;
        arrow.userData.color = color;
        directionArrows.add(arrow);
      });
    });
  });
});

for (let i = 0; i < 120; i += 1) {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 14, 10),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0xb785ff : 0xffd166, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  dot.userData.curve = curves[i % curves.length];
  dot.userData.offset = Math.random();
  movingDots.add(dot);
}

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const pixelRatio = renderer.getPixelRatio();
  if (canvas.width !== Math.floor(width * pixelRatio) || canvas.height !== Math.floor(height * pixelRatio)) {
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }
}

function update(time) {
  const strength = Math.max(0.1, Math.abs(Number(strengthSlider.value)));
  readout.textContent = `${strength.toFixed(1)} loop strength`;

  sphere.visible = surfaceToggle.checked;
  sphereWire.visible = surfaceToggle.checked;
  zeroFlux.material.opacity = surfaceToggle.checked ? 0.95 : 0.35;
  fieldLines.visible = fieldToggle.checked;
  directionArrows.visible = fieldToggle.checked;
  movingDots.visible = fieldToggle.checked && animateToggle.checked;

  sphere.rotation.y = time * 0.04;
  sphereWire.rotation.y = -time * 0.035;
  sphereWire.rotation.z = time * 0.025;
  magnet.rotation.y = Math.sin(time * 0.42) * 0.06;

  fieldLines.children.forEach((line, index) => {
    line.material.opacity = 0.72 + 0.26 * Math.sin(time * 1.8 + index * 0.35) ** 2;
  });

  const speed = 0.055 + strength * 0.035;
  directionArrows.children.forEach((arrow) => {
    const u = (arrow.userData.spot + time * speed * 0.4) % 1;
    arrow.position.copy(arrow.userData.curve.getPointAt(u));
    arrow.setDirection(arrow.userData.curve.getTangentAt(u));
    arrow.setLength(0.42 + strength * 0.025, 0.15, 0.1);
    arrow.setColor(arrow.userData.color);
  });

  movingDots.children.forEach((dot, index) => {
    const u = (dot.userData.offset + time * speed) % 1;
    dot.position.copy(dot.userData.curve.getPointAt(u));
    dot.scale.setScalar(0.75 + 0.65 * Math.sin(Math.PI * u) ** 2);
    dot.material.opacity = 0.25 + 0.72 * Math.sin(Math.PI * u) ** 2;
    dot.material.color.copy(index % 2 ? purple : gold).lerp(white, 0.18);
  });
}

function animate(now) {
  const time = now * 0.001;
  resize();
  controls.update();
  update(time);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.dataset.scene !== 'gaussMagnetic') {
      setText('#scene-status', 'Scene stub');
      setText('#scene-title', 'This build is focused on Gauss magnetism.');
      setText('#scene-intro', 'Switch back to Gauss: Magnetism to inspect the current visual pass.');
      tabs.forEach((each) => each.classList.toggle('active', each === tab));
      return;
    }
    showMagnetismText();
  });
});

showMagnetismText();
requestAnimationFrame(animate);
