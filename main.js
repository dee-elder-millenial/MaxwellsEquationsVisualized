import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#maxwell-canvas');
const strengthSlider = document.querySelector('#charge-strength');
const readout = document.querySelector('#charge-readout');
const surfaceToggle = document.querySelector('#show-surface');
const fieldToggle = document.querySelector('#show-arrows');
const animateToggle = document.querySelector('#animate-field');
const tabs = [...document.querySelectorAll('.equation-tab')];
let activeScene = 'divergence';

const setText = (selector, value, asHtml = false) => {
  const el = document.querySelector(selector);
  if (asHtml) el.innerHTML = value;
  else el.textContent = value;
};

const copy = {
  divergence: {
    badge: 'Divergence Operator',
    status: 'Interactive intro',
    title: 'Divergence measures spreading out.',
    intro: 'Before Maxwell, meet the dot: divergence asks whether a field flows outward from a point, inward toward it, or simply passes around without piling up.',
    equation: '∇ · <strong>F</strong>',
    summary: 'Positive divergence means field flows outward like a source. Negative divergence means field flows inward like a drain. Zero divergence means no net source or sink.',
    lesson: 'The arrows are a vector field. When more arrows leave the transparent surface than enter it, divergence is positive. When more enter than leave, divergence is negative.',
  },
  gaussElectric: {
    badge: "Gauss's Law for Electricity",
    status: 'Interactive scene',
    title: 'Electric charge makes space point outward.',
    intro: 'A charge inside a transparent surface creates electric flux through that surface.',
    equation: '∇ · <strong>E</strong> = ρ / ε₀',
    summary: 'Positive charge acts like a source of electric field. Negative charge acts like a sink.',
    lesson: 'The glass sphere is a Gaussian surface. The field arrows crossing it show electric flux: more enclosed charge means more net field through the surface.',
  },
  gaussMagnetic: {
    badge: "Gauss's Law for Magnetism",
    status: 'Interactive scene',
    title: 'Magnetic field lines always close.',
    intro: 'A bar magnet bends the magnetic field into bright closed loops. The transparent sphere shows that magnetic field enters and leaves in equal measure.',
    equation: '∇ · <strong>B</strong> = 0',
    summary: 'There are no isolated magnetic sources or sinks. The net magnetic flux through any closed surface is zero.',
    lesson: 'The glowing loops leave the north pole, curve around, and return to the south pole. They cross the Gaussian surface both ways, so the total magnetic flux cancels.',
  },
  faraday: {
    badge: "Faraday's Law",
    status: 'Scene stub',
    title: 'Changing magnetism makes electric fields curl.',
    intro: 'Coming next: changing magnetic flux through a loop creates a circulating electric field.',
    equation: '∇ × <strong>E</strong> = −∂<strong>B</strong>/∂t',
    summary: 'Changing magnetic flux creates curling electric field.',
    lesson: 'Planned scene: a pulsing magnetic field through a wire loop with swirling electric arrows.',
  },
  ampereMaxwell: {
    badge: 'Ampère-Maxwell Law',
    status: 'Scene stub',
    title: 'Current makes magnetism curl.',
    intro: 'Coming later: current and changing electric fields creating magnetic curls.',
    equation: '∇ × <strong>B</strong> = μ₀<strong>J</strong> + μ₀ε₀∂<strong>E</strong>/∂t',
    summary: 'Current and changing electric field create curling magnetic field.',
    lesson: 'Planned scene: a current-carrying wire and capacitor displacement current.',
  },
};

function setScene(name) {
  activeScene = name;
  const c = copy[name];
  setText('#scene-badge', c.badge);
  setText('#scene-status', c.status);
  setText('#scene-title', c.title);
  setText('#scene-intro', c.intro);
  setText('#equation-label', name === 'divergence' ? 'Operator meaning' : 'Differential form');
  setText('#equation', c.equation, true);
  setText('#equation-summary', c.summary);
  setText('#lesson-title', name === 'faraday' || name === 'ampereMaxwell' ? 'Planned visualization' : 'What you are seeing');
  setText('#lesson-copy', c.lesson);
  document.querySelector('#placeholder-card').hidden = name === 'divergence' || name === 'gaussElectric' || name === 'gaussMagnetic';
  divergenceRoot.visible = name === 'divergence';
  electricRoot.visible = name === 'gaussElectric' || name === 'faraday' || name === 'ampereMaxwell';
  magnetRoot.visible = name === 'gaussMagnetic';
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.scene === name));
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

const divergenceRoot = new THREE.Group();
const electricRoot = new THREE.Group();
const magnetRoot = new THREE.Group();
root.add(divergenceRoot, electricRoot, magnetRoot);

const blue = new THREE.Color(0x59d8ff);
const red = new THREE.Color(0xff5470);
const purple = new THREE.Color(0xb785ff);
const gold = new THREE.Color(0xffd166);
const green = new THREE.Color(0x8dffb0);
const white = new THREE.Color(0xffffff);

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
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(labelCanvas), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  sprite.scale.set(1.25 * scale, 0.46 * scale, 1);
  return sprite;
}

function makeSurface(color, opacity = 0.08, wireOpacity = 0.12) {
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(2.75, 72, 48), new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity, transmission: 0.2, thickness: 0.3, side: THREE.DoubleSide }));
  const wire = new THREE.Mesh(new THREE.SphereGeometry(2.77, 32, 20), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: wireOpacity }));
  return { sphere, wire };
}

const divSurface = makeSurface(0x8dffb0, 0.1, 0.15);
divergenceRoot.add(divSurface.sphere, divSurface.wire);
const divCore = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 20), new THREE.MeshStandardMaterial({ color: green, emissive: green, emissiveIntensity: 1.6 }));
divergenceRoot.add(divCore);
const divLabel = makeLabel('SOURCE', '#8dffb0', 1.1);
divLabel.position.set(0, -1.75, 0);
divergenceRoot.add(divLabel);
const divArrows = new THREE.Group();
const divDots = new THREE.Group();
divergenceRoot.add(divArrows, divDots);
const divDirections = [];
function fibDirection(i, n) {
  const y = 1 - (i / (n - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = Math.PI * (3 - Math.sqrt(5)) * i;
  return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).normalize();
}
for (let i = 0; i < 54; i += 1) {
  const d = fibDirection(i, 54);
  divDirections.push(d.clone());
  [0.85, 1.45, 2.05, 2.65].forEach((r) => {
    const arrow = new THREE.ArrowHelper(d, d.clone().multiplyScalar(r), 0.4, 0x8dffb0, 0.13, 0.08);
    arrow.userData.d = d.clone();
    arrow.userData.r = r;
    divArrows.add(arrow);
  });
}
for (let i = 0; i < 90; i += 1) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshBasicMaterial({ color: 0xd8ffe4, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  dot.userData.d = divDirections[i % divDirections.length].clone();
  dot.userData.offset = Math.random();
  divDots.add(dot);
}

const chargeCore = new THREE.Mesh(new THREE.SphereGeometry(0.38, 48, 32), new THREE.MeshStandardMaterial({ color: blue, emissive: blue, emissiveIntensity: 2.3, roughness: 0.2 }));
const chargeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 32), new THREE.MeshBasicMaterial({ color: blue, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
electricRoot.add(chargeCore, chargeGlow);
const eSurface = makeSurface(0x79ddff, 0.12, 0.16);
electricRoot.add(eSurface.sphere, eSurface.wire);
const eArrows = new THREE.Group();
const eDots = new THREE.Group();
electricRoot.add(eArrows, eDots);
const eDirs = [];
for (let i = 0; i < 58; i += 1) {
  const d = fibDirection(i, 58);
  eDirs.push(d.clone());
  [1.1, 1.75, 2.4, 3.1].forEach((r) => {
    const arrow = new THREE.ArrowHelper(d, d.clone().multiplyScalar(r), 0.46, 0x59d8ff, 0.14, 0.08);
    arrow.userData.d = d.clone();
    arrow.userData.r = r;
    eArrows.add(arrow);
  });
}
for (let i = 0; i < 100; i += 1) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshBasicMaterial({ color: 0xcdf7ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  dot.userData.d = eDirs[i % eDirs.length].clone();
  dot.userData.offset = Math.random();
  eDots.add(dot);
}

const magnet = new THREE.Group();
const north = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.82, 0.82), new THREE.MeshStandardMaterial({ color: 0xff486d, emissive: 0x8a1330, emissiveIntensity: 0.95, metalness: 0.34, roughness: 0.18 }));
north.position.x = 0.88;
const south = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.82, 0.82), new THREE.MeshStandardMaterial({ color: 0x4ddfff, emissive: 0x125d78, emissiveIntensity: 0.95, metalness: 0.34, roughness: 0.18 }));
south.position.x = -0.88;
const seam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
magnet.add(north, south, seam);
const nLabel = makeLabel('N', '#ff9aae', 0.9);
nLabel.position.set(1.82, 0.82, 0.02);
const sLabel = makeLabel('S', '#9aefff', 0.9);
sLabel.position.set(-1.82, 0.82, 0.02);
magnet.add(nLabel, sLabel);
magnetRoot.add(magnet);
const mSurface = makeSurface(0x9d7cff, 0.055, 0.09);
magnetRoot.add(mSurface.sphere, mSurface.wire);
const zeroFlux = makeLabel('NET FLUX = 0', '#fff2a8', 1.45);
zeroFlux.position.set(0, -2.05, 0);
magnetRoot.add(zeroFlux);
const fieldLines = new THREE.Group();
const movingDots = new THREE.Group();
const directionArrows = new THREE.Group();
magnetRoot.add(fieldLines, movingDots, directionArrows);
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
      fieldLines.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.035 + heightIndex * 0.006, 12, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending })));
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
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xb785ff : 0xffd166, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
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

function updateRadialScene(time, group) {
  const value = Number(strengthSlider.value);
  const magnitude = Math.abs(value);
  const positive = value >= 0;
  const color = activeScene === 'divergence' ? (positive ? green : red) : (positive ? blue : red);
  const arrows = group === divergenceRoot ? divArrows : eArrows;
  const dots = group === divergenceRoot ? divDots : eDots;
  const surface = group === divergenceRoot ? divSurface : eSurface;
  const center = group === divergenceRoot ? divCore : chargeCore;
  const glow = group === divergenceRoot ? null : chargeGlow;
  readout.textContent = activeScene === 'divergence'
    ? `${value >= 0 ? '+' : ''}${value.toFixed(1)} divergence`
    : `${value >= 0 ? '+' : ''}${value.toFixed(1)} charge`;
  center.material.color.copy(color);
  center.material.emissive.copy(color);
  center.material.emissiveIntensity = 1.1 + magnitude * 0.5;
  if (glow) {
    glow.material.color.copy(color);
    glow.material.opacity = 0.06 + magnitude * 0.045;
    glow.scale.setScalar(0.88 + magnitude * 0.07 + Math.sin(time * 2.4) * 0.04);
  }
  if (activeScene === 'divergence') {
    divLabel.textContent = '';
    divLabel.material.opacity = 1;
  }
  surface.sphere.visible = surfaceToggle.checked;
  surface.wire.visible = surfaceToggle.checked;
  arrows.visible = fieldToggle.checked;
  dots.visible = fieldToggle.checked && animateToggle.checked;
  surface.sphere.rotation.y = time * 0.08;
  surface.wire.rotation.y = -time * 0.06;
  const arrowScale = THREE.MathUtils.mapLinear(magnitude, 0, 5, 0.25, 1.35);
  arrows.children.forEach((arrow, index) => {
    const direction = arrow.userData.d.clone().multiplyScalar(positive ? 1 : -1);
    arrow.position.copy(arrow.userData.d.clone().multiplyScalar(arrow.userData.r));
    arrow.setDirection(direction);
    arrow.setLength((0.27 + 0.26 * arrowScale) * (1 + 0.08 * Math.sin(time * 3 + index)), 0.14 * arrowScale, 0.08 * arrowScale);
    arrow.setColor(color.clone().lerp(white, 0.3));
  });
  dots.children.forEach((dot, index) => {
    const cycle = (dot.userData.offset + time * (0.1 + magnitude * 0.035)) % 1;
    const radius = THREE.MathUtils.lerp(0.56, 3.35, positive ? cycle : 1 - cycle);
    dot.position.copy(dot.userData.d.clone().multiplyScalar(radius + 0.03 * Math.sin(time * 4 + index)));
    dot.material.color.copy(color).lerp(white, 0.5);
    dot.material.opacity = 0.18 + 0.58 * Math.sin(Math.PI * cycle);
  });
  if (activeScene === 'divergence') {
    const labelText = Math.abs(value) < 0.25 ? 'ZERO DIVERGENCE' : (positive ? 'SOURCE' : 'SINK');
    const labelColor = Math.abs(value) < 0.25 ? '#d7e2ff' : (positive ? '#8dffb0' : '#ff8da2');
    divergenceRoot.remove(divLabel);
    const newLabel = makeLabel(labelText, labelColor, labelText === 'ZERO DIVERGENCE' ? 1.35 : 1.1);
    newLabel.position.set(0, -1.75, 0);
    divLabel.copy(newLabel);
    divergenceRoot.add(divLabel);
  }
}

function updateMagnetic(time) {
  const strength = Math.max(0.1, Math.abs(Number(strengthSlider.value)));
  readout.textContent = `${strength.toFixed(1)} loop strength`;
  mSurface.sphere.visible = surfaceToggle.checked;
  mSurface.wire.visible = surfaceToggle.checked;
  zeroFlux.material.opacity = surfaceToggle.checked ? 0.95 : 0.35;
  fieldLines.visible = fieldToggle.checked;
  directionArrows.visible = fieldToggle.checked;
  movingDots.visible = fieldToggle.checked && animateToggle.checked;
  mSurface.sphere.rotation.y = time * 0.04;
  mSurface.wire.rotation.y = -time * 0.035;
  mSurface.wire.rotation.z = time * 0.025;
  magnet.rotation.y = Math.sin(time * 0.42) * 0.06;
  fieldLines.children.forEach((line, index) => { line.material.opacity = 0.72 + 0.26 * Math.sin(time * 1.8 + index * 0.35) ** 2; });
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
  if (activeScene === 'divergence') updateRadialScene(time, divergenceRoot);
  if (activeScene === 'gaussElectric' || activeScene === 'faraday' || activeScene === 'ampereMaxwell') updateRadialScene(time, electricRoot);
  if (activeScene === 'gaussMagnetic') updateMagnetic(time);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

tabs.forEach((tab) => tab.addEventListener('click', () => setScene(tab.dataset.scene)));

setScene('divergence');
requestAnimationFrame(animate);
