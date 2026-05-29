import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#maxwell-canvas');
const chargeSlider = document.querySelector('#charge-strength');
const chargeReadout = document.querySelector('#charge-readout');
const showSurfaceToggle = document.querySelector('#show-surface');
const showArrowsToggle = document.querySelector('#show-arrows');
const animateToggle = document.querySelector('#animate-field');
const sceneBadge = document.querySelector('#scene-badge');
const sceneStatus = document.querySelector('#scene-status');
const sceneTitle = document.querySelector('#scene-title');
const sceneIntro = document.querySelector('#scene-intro');
const equationLabel = document.querySelector('#equation-label');
const equation = document.querySelector('#equation');
const equationSummary = document.querySelector('#equation-summary');
const lessonTitle = document.querySelector('#lesson-title');
const lessonCopy = document.querySelector('#lesson-copy');
const gaussControls = document.querySelector('#gauss-controls');
const placeholderCard = document.querySelector('#placeholder-card');
const placeholderCopy = document.querySelector('#placeholder-copy');
const equationTabs = [...document.querySelectorAll('.equation-tab')];

const sceneCopy = {
  gaussElectric: {
    badge: "Gauss's Law for Electricity",
    status: 'Interactive scene',
    title: 'Electric charge makes space point outward.',
    intro: "A first interactive glimpse at Gauss's Law: a charge inside a transparent surface creates electric flux through that surface.",
    label: 'Differential form',
    equation: '∇ · <strong>E</strong> = ρ / ε₀',
    summary: 'Positive charge acts like a source of electric field. Negative charge acts like a sink. The more charge enclosed, the more electric field flows through the surrounding surface.',
    lessonTitle: 'What you are seeing',
    lesson: "The glass sphere is not a physical object. It is an imaginary measuring surface. Gauss's Law says the net electric flux through that closed surface depends only on the charge inside it.",
    placeholder: '',
  },
  gaussMagnetic: {
    badge: "Gauss's Law for Magnetism",
    status: 'Interactive scene',
    title: 'Magnetic field lines close on themselves.',
    intro: 'A bar magnet bends the magnetic field into loops. Lines leave one end, arc through space, and return through the other: no beginnings, no endings, no magnetic monopoles.',
    label: 'Differential form',
    equation: '∇ · <strong>B</strong> = 0',
    summary: 'The magnetic field has zero divergence. Through any closed surface, as much magnetic field enters as leaves, so the net magnetic flux is always zero.',
    lessonTitle: 'What you are seeing',
    lesson: 'The transparent sphere is a magnetic Gaussian surface. The violet loops pass through it in both directions. Unlike electric charge, a magnet does not create a net source or sink of field lines.',
    placeholder: '',
  },
  faraday: {
    badge: "Faraday's Law",
    status: 'Scene stub',
    title: 'Changing magnetism makes electric fields curl.',
    intro: 'This scene will make induction visible: a changing magnetic field through a loop creates a circulating electric field around that changing flux.',
    label: 'Differential form',
    equation: '∇ × <strong>E</strong> = −∂<strong>B</strong>/∂t',
    summary: 'When magnetic flux changes over time, the electric field curls. This is the engine behind generators, transformers, and electromagnetic induction.',
    lessonTitle: 'Planned visualization',
    lesson: 'A pulsing magnetic field will pass through a wire loop while electric field arrows swirl around it. Faster change means stronger curl.',
    placeholder: 'Next build: animated magnetic flux through a loop, with curling electric arrows and a slider for flux-change speed.',
  },
  ampereMaxwell: {
    badge: 'Ampère-Maxwell Law',
    status: 'Scene stub',
    title: 'Current and changing electric fields make magnetism curl.',
    intro: "This scene will connect ordinary current with Maxwell's crucial upgrade: even a changing electric field can generate a magnetic field.",
    label: 'Differential form',
    equation: '∇ × <strong>B</strong> = μ₀<strong>J</strong> + μ₀ε₀∂<strong>E</strong>/∂t',
    summary: 'Magnetic fields curl around electric current. Maxwell added that changing electric fields also create curling magnetic fields, completing the symmetry that allows light to travel.',
    lessonTitle: 'Planned visualization',
    lesson: 'A current-carrying wire will show magnetic loops curling around it, then a capacitor view will show displacement current bridging the gap.',
    placeholder: 'Next build: magnetic field rings around a wire and a capacitor scene showing changing electric field acting like current.',
  },
};

let activeScene = 'gaussElectric';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060817, 0.055);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(4.8, 3.2, 6.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;
controls.minDistance = 3.8;
controls.maxDistance = 13;

const root = new THREE.Group();
scene.add(root);

const electricBlue = new THREE.Color(0x59d8ff);
const electricRed = new THREE.Color(0xff5470);
const magneticPurple = new THREE.Color(0xb785ff);
const magneticGold = new THREE.Color(0xffd166);
const whiteHot = new THREE.Color(0xffffff);

scene.add(new THREE.AmbientLight(0x8fbfff, 1.1));
const key = new THREE.PointLight(0x7be4ff, 75, 16);
key.position.set(3, 4, 5);
scene.add(key);
const fill = new THREE.PointLight(0xff6d8d, 30, 12);
fill.position.set(-4, -2, -3);
scene.add(fill);

function makeStarField() {
  const count = 650;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = THREE.MathUtils.randFloat(14, 36);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xcfeaff, size: 0.028, transparent: true, opacity: 0.62, depthWrite: false });
  return new THREE.Points(geometry, material);
}
scene.add(makeStarField());

function makeGrid() {
  const grid = new THREE.GridHelper(12, 24, 0x1a7fa5, 0x16384f);
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  grid.position.y = -2.45;
  return grid;
}
root.add(makeGrid());

const electricGroup = new THREE.Group();
const magneticGroup = new THREE.Group();
root.add(electricGroup, magneticGroup);

function makeGlassSphere(color = 0x79ddff) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.45, 72, 48),
    new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.14, roughness: 0.05, metalness: 0, transmission: 0.35, thickness: 0.5, side: THREE.DoubleSide }),
  );
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(2.46, 36, 24),
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.16 }),
  );
  return { sphere, wire };
}

const chargeCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.34, 48, 32),
  new THREE.MeshStandardMaterial({ color: electricBlue, emissive: electricBlue, emissiveIntensity: 2.4, metalness: 0.1, roughness: 0.22 }),
);
const chargeGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 48, 32),
  new THREE.MeshBasicMaterial({ color: electricBlue, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }),
);
electricGroup.add(chargeCore, chargeGlow);
const electricSurface = makeGlassSphere(0x79ddff);
electricGroup.add(electricSurface.sphere, electricSurface.wire);

const electricArrows = new THREE.Group();
electricGroup.add(electricArrows);
const electricDirections = [];
const electricRadii = [1.15, 1.75, 2.35, 3.05];
const arrowColor = new THREE.Color();

function fibonacciDirection(index, total) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;
  return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).normalize();
}

for (let i = 0; i < 54; i += 1) {
  const direction = fibonacciDirection(i, 54);
  electricDirections.push(direction.clone());
  for (const radius of electricRadii) {
    const arrow = new THREE.ArrowHelper(direction, direction.clone().multiplyScalar(radius), 0.42, 0x59d8ff, 0.13, 0.075);
    arrow.userData.baseDirection = direction.clone();
    arrow.userData.baseRadius = radius;
    electricArrows.add(arrow);
  }
}

const electricPulses = new THREE.Group();
electricGroup.add(electricPulses);
for (let i = 0; i < 90; i += 1) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xcdf7ff, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  particle.userData.direction = electricDirections[i % electricDirections.length].clone();
  particle.userData.offset = Math.random();
  electricPulses.add(particle);
}

function makeTextSprite(text, color = '#ffffff') {
  const canvas2d = document.createElement('canvas');
  canvas2d.width = 256;
  canvas2d.height = 128;
  const ctx = canvas2d.getContext('2d');
  ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
  ctx.font = '900 54px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 64);
  const texture = new THREE.CanvasTexture(canvas2d);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.85, 0.42, 1);
  return sprite;
}

const magnet = new THREE.Group();
const northMat = new THREE.MeshStandardMaterial({ color: 0xff5470, emissive: 0x661326, emissiveIntensity: 0.55, metalness: 0.28, roughness: 0.22 });
const southMat = new THREE.MeshStandardMaterial({ color: 0x59d8ff, emissive: 0x164d66, emissiveIntensity: 0.55, metalness: 0.28, roughness: 0.22 });
const capGeom = new THREE.BoxGeometry(1.35, 0.62, 0.62);
const north = new THREE.Mesh(capGeom, northMat);
north.position.x = 0.68;
const south = new THREE.Mesh(capGeom, southMat);
south.position.x = -0.68;
const seam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.66, 0.66), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
magnet.add(north, south, seam);
const nLabel = makeTextSprite('N', '#ff8da2');
nLabel.position.set(1.45, 0.66, 0);
const sLabel = makeTextSprite('S', '#8be7ff');
sLabel.position.set(-1.45, 0.66, 0);
magnet.add(nLabel, sLabel);
magneticGroup.add(magnet);

const magneticSurface = makeGlassSphere(0xb785ff);
magneticGroup.add(magneticSurface.sphere, magneticSurface.wire);

const magneticLines = new THREE.Group();
const magneticParticles = new THREE.Group();
magneticGroup.add(magneticLines, magneticParticles);

function makeLoopCurve(radiusY, zOffset, upper = true) {
  const points = [];
  const sign = upper ? 1 : -1;
  for (let i = 0; i <= 128; i += 1) {
    const t = (i / 128) * Math.PI * 2;
    const x = 2.15 * Math.cos(t);
    const y = sign * radiusY * Math.sin(t);
    const z = zOffset + 0.24 * Math.sin(2 * t);
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.45);
}

const loopCurves = [];
[0, 0.72, -0.72].forEach((zOffset) => {
  [0.82, 1.22, 1.64].forEach((radiusY) => {
    [true, false].forEach((upper) => {
      const curve = makeLoopCurve(radiusY, zOffset, upper);
      loopCurves.push(curve);
      const geometry = new THREE.TubeGeometry(curve, 128, 0.014, 8, true);
      const material = new THREE.MeshBasicMaterial({ color: upper ? 0xb785ff : 0xffd166, transparent: true, opacity: 0.74, blending: THREE.AdditiveBlending });
      magneticLines.add(new THREE.Mesh(geometry, material));
    });
  });
});

for (let i = 0; i < 72; i += 1) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 8),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0xb785ff : 0xffd166, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  particle.userData.curve = loopCurves[i % loopCurves.length];
  particle.userData.offset = Math.random();
  magneticParticles.add(particle);
}

function setObjectColor(object, color) {
  if (object.material?.color) object.material.color.copy(color);
  if (object.material?.emissive) object.material.emissive.copy(color);
}

function setScene(nextScene) {
  activeScene = nextScene;
  const copy = sceneCopy[nextScene];
  sceneBadge.textContent = copy.badge;
  sceneStatus.textContent = copy.status;
  sceneTitle.textContent = copy.title;
  sceneIntro.textContent = copy.intro;
  equationLabel.textContent = copy.label;
  equation.innerHTML = copy.equation;
  equationSummary.textContent = copy.summary;
  lessonTitle.textContent = copy.lessonTitle;
  lessonCopy.textContent = copy.lesson;

  const isImplemented = nextScene === 'gaussElectric' || nextScene === 'gaussMagnetic';
  const hasControls = isImplemented;
  gaussControls.classList.toggle('is-disabled', !hasControls);
  placeholderCard.hidden = isImplemented;
  placeholderCopy.textContent = copy.placeholder;
  electricGroup.visible = nextScene === 'gaussElectric' || !isImplemented;
  magneticGroup.visible = nextScene === 'gaussMagnetic';
  equationTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.scene === nextScene));
}

function updateElectricScene(timeSeconds) {
  const charge = Number(chargeSlider.value);
  const magnitude = Math.abs(charge);
  const positive = charge >= 0;
  const activeColor = positive ? electricBlue : electricRed;
  const directionSign = positive ? 1 : -1;
  const strengthScale = THREE.MathUtils.mapLinear(magnitude, 0, 5, 0.25, 1.35);

  chargeReadout.textContent = `${charge >= 0 ? '+' : ''}${charge.toFixed(1)}`;
  setObjectColor(chargeCore, activeColor);
  setObjectColor(chargeGlow, activeColor);
  chargeCore.material.emissiveIntensity = 1.2 + magnitude * 0.58;
  chargeGlow.material.opacity = 0.06 + magnitude * 0.045;
  chargeGlow.scale.setScalar(0.86 + Math.sin(timeSeconds * 2.4) * 0.04 + magnitude * 0.07);

  electricSurface.sphere.visible = showSurfaceToggle.checked;
  electricSurface.wire.visible = showSurfaceToggle.checked;
  electricArrows.visible = showArrowsToggle.checked;
  electricPulses.visible = animateToggle.checked && showArrowsToggle.checked;
  electricSurface.sphere.rotation.y = timeSeconds * 0.08;
  electricSurface.wire.rotation.y = timeSeconds * -0.06;
  electricSurface.wire.rotation.x = timeSeconds * 0.035;

  electricArrows.children.forEach((arrow, index) => {
    const baseDirection = arrow.userData.baseDirection.clone().multiplyScalar(directionSign);
    const baseRadius = arrow.userData.baseRadius;
    const pulse = 0.08 * Math.sin(timeSeconds * 3 + index * 0.37);
    const length = (0.25 + 0.25 * strengthScale) * (1 + pulse);
    arrow.position.copy(arrow.userData.baseDirection.clone().multiplyScalar(baseRadius));
    arrow.setDirection(baseDirection);
    arrow.setLength(length, 0.13 * strengthScale, 0.075 * strengthScale);
    arrowColor.copy(activeColor).lerp(whiteHot, 0.22 + Math.min(0.45, magnitude * 0.05));
    arrow.setColor(arrowColor);
  });

  electricPulses.children.forEach((particle, index) => {
    const cycle = (timeSeconds * (0.11 + magnitude * 0.035) + particle.userData.offset) % 1;
    const radius = THREE.MathUtils.lerp(0.58, 3.32, positive ? cycle : 1 - cycle);
    const wobble = 0.035 * Math.sin(timeSeconds * 4 + index);
    particle.position.copy(particle.userData.direction.clone().multiplyScalar(radius + wobble));
    particle.scale.setScalar(0.55 + strengthScale * 0.75 * (1 - Math.abs(cycle - 0.5)));
    particle.material.color.copy(activeColor).lerp(whiteHot, 0.55);
    particle.material.opacity = 0.18 + 0.58 * Math.sin(Math.PI * cycle);
  });
}

function updateMagneticScene(timeSeconds) {
  const strength = Math.abs(Number(chargeSlider.value));
  const speed = 0.08 + strength * 0.035;
  chargeReadout.textContent = `${strength.toFixed(1)} loop strength`;
  magneticSurface.sphere.visible = showSurfaceToggle.checked;
  magneticSurface.wire.visible = showSurfaceToggle.checked;
  magneticLines.visible = showArrowsToggle.checked;
  magneticParticles.visible = animateToggle.checked && showArrowsToggle.checked;
  magneticSurface.sphere.rotation.y = timeSeconds * 0.06;
  magneticSurface.wire.rotation.y = timeSeconds * -0.05;
  magneticSurface.wire.rotation.z = timeSeconds * 0.025;
  magnet.rotation.y = Math.sin(timeSeconds * 0.6) * 0.08;

  magneticLines.children.forEach((line, index) => {
    line.material.opacity = 0.36 + 0.35 * Math.sin(timeSeconds * 1.7 + index * 0.4) ** 2;
  });

  magneticParticles.children.forEach((particle, index) => {
    const cycle = (particle.userData.offset + timeSeconds * speed) % 1;
    particle.position.copy(particle.userData.curve.getPointAt(cycle));
    particle.scale.setScalar(0.7 + 0.55 * Math.sin(Math.PI * cycle) ** 2);
    particle.material.opacity = 0.22 + 0.7 * Math.sin(Math.PI * cycle) ** 2;
    particle.material.color.copy(index % 2 ? magneticPurple : magneticGold).lerp(whiteHot, 0.18);
  });
}

function updateFieldVisuals(timeSeconds = 0) {
  if (activeScene === 'gaussElectric') updateElectricScene(timeSeconds);
  if (activeScene === 'gaussMagnetic') updateMagneticScene(timeSeconds);
}

function resizeRendererToDisplaySize() {
  const { clientWidth, clientHeight } = canvas;
  const needResize = canvas.width !== Math.floor(clientWidth * renderer.getPixelRatio()) || canvas.height !== Math.floor(clientHeight * renderer.getPixelRatio());
  if (needResize) {
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
  }
}

chargeSlider.addEventListener('input', () => updateFieldVisuals(performance.now() * 0.001));
showSurfaceToggle.addEventListener('change', () => updateFieldVisuals(performance.now() * 0.001));
showArrowsToggle.addEventListener('change', () => updateFieldVisuals(performance.now() * 0.001));
animateToggle.addEventListener('change', () => updateFieldVisuals(performance.now() * 0.001));
equationTabs.forEach((tab) => tab.addEventListener('click', () => setScene(tab.dataset.scene)));

function animate(now) {
  const timeSeconds = now * 0.001;
  resizeRendererToDisplaySize();
  controls.update();
  updateFieldVisuals(timeSeconds);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setScene('gaussElectric');
updateFieldVisuals();
requestAnimationFrame(animate);
