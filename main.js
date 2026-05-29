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
    status: 'Scene stub',
    title: 'Magnetic field lines do not begin or end.',
    intro: 'This scene will show magnetic field loops closing back on themselves around a magnet, with no isolated north or south magnetic charge hiding in the machinery.',
    label: 'Differential form',
    equation: '∇ · <strong>B</strong> = 0',
    summary: 'Magnetism has no known monopole source. Magnetic field lines form closed loops, so the net magnetic flux through any closed surface is zero.',
    lessonTitle: 'Planned visualization',
    lesson: 'A bar magnet will sit inside a transparent surface while magnetic field loops enter and leave in equal measure. The surface catches no net beginning or ending of the magnetic field.',
    placeholder: 'Next build: looping magnetic field curves around a bar magnet, plus a flux-balance surface showing equal field entering and leaving.',
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

  const isGaussElectric = nextScene === 'gaussElectric';
  gaussControls.classList.toggle('is-disabled', !isGaussElectric);
  placeholderCard.hidden = isGaussElectric;
  placeholderCopy.textContent = copy.placeholder;

  equationTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.scene === nextScene);
  });
}

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

const coolElectric = new THREE.Color(0x59d8ff);
const warmElectric = new THREE.Color(0xff5470);
const whiteHot = new THREE.Color(0xffffff);

const ambient = new THREE.AmbientLight(0x8fbfff, 1.1);
scene.add(ambient);

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

  const material = new THREE.PointsMaterial({
    color: 0xcfeaff,
    size: 0.028,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });

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

const chargeCoreMaterial = new THREE.MeshStandardMaterial({
  color: coolElectric,
  emissive: coolElectric,
  emissiveIntensity: 2.4,
  metalness: 0.1,
  roughness: 0.22,
});

const chargeCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.34, 48, 32),
  chargeCoreMaterial,
);
root.add(chargeCore);

const chargeGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 48, 32),
  new THREE.MeshBasicMaterial({
    color: coolElectric,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
root.add(chargeGlow);

const gaussianSurface = new THREE.Mesh(
  new THREE.SphereGeometry(2.45, 72, 48),
  new THREE.MeshPhysicalMaterial({
    color: 0x79ddff,
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.35,
    thickness: 0.5,
    side: THREE.DoubleSide,
  }),
);
root.add(gaussianSurface);

const surfaceWire = new THREE.Mesh(
  new THREE.SphereGeometry(2.46, 36, 24),
  new THREE.MeshBasicMaterial({
    color: 0x92e8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
  }),
);
root.add(surfaceWire);

const arrows = new THREE.Group();
root.add(arrows);

const arrowDirections = [];
const arrowRadii = [1.15, 1.75, 2.35, 3.05];
const arrowColor = new THREE.Color();

function fibonacciDirection(index, total) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;
  return new THREE.Vector3(
    Math.cos(theta) * radius,
    y,
    Math.sin(theta) * radius,
  ).normalize();
}

function buildArrows() {
  arrows.clear();
  arrowDirections.length = 0;

  const directions = 54;
  for (let i = 0; i < directions; i += 1) {
    const direction = fibonacciDirection(i, directions);
    arrowDirections.push(direction.clone());

    for (const radius of arrowRadii) {
      const arrow = new THREE.ArrowHelper(
        direction,
        direction.clone().multiplyScalar(radius),
        0.42,
        0x59d8ff,
        0.13,
        0.075,
      );
      arrow.userData.baseDirection = direction.clone();
      arrow.userData.baseRadius = radius;
      arrows.add(arrow);
    }
  }
}
buildArrows();

const pulseParticles = new THREE.Group();
root.add(pulseParticles);

function makePulseParticle(direction, offset) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 8),
    new THREE.MeshBasicMaterial({
      color: 0xcdf7ff,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  particle.userData.direction = direction;
  particle.userData.offset = offset;
  return particle;
}

for (let i = 0; i < 90; i += 1) {
  pulseParticles.add(makePulseParticle(
    arrowDirections[i % arrowDirections.length].clone(),
    Math.random(),
  ));
}

function setObjectColor(object, color) {
  if (object.material?.color) object.material.color.copy(color);
  if (object.material?.emissive) object.material.emissive.copy(color);
}

function updateFieldVisuals(timeSeconds = 0) {
  const charge = Number(chargeSlider.value);
  const magnitude = Math.abs(charge);
  const positive = charge >= 0;
  const activeColor = positive ? coolElectric : warmElectric;
  const directionSign = positive ? 1 : -1;
  const strengthScale = THREE.MathUtils.mapLinear(magnitude, 0, 5, 0.25, 1.35);
  const active = activeScene === 'gaussElectric';

  chargeReadout.textContent = `${charge >= 0 ? '+' : ''}${charge.toFixed(1)}`;

  setObjectColor(chargeCore, activeColor);
  setObjectColor(chargeGlow, activeColor);
  chargeCore.material.emissiveIntensity = active ? 1.2 + magnitude * 0.58 : 0.42;
  chargeGlow.material.opacity = active ? 0.06 + magnitude * 0.045 : 0.035;
  chargeGlow.scale.setScalar(0.86 + Math.sin(timeSeconds * 2.4) * 0.04 + magnitude * 0.07);

  gaussianSurface.visible = showSurfaceToggle.checked;
  surfaceWire.visible = showSurfaceToggle.checked;
  arrows.visible = showArrowsToggle.checked;
  pulseParticles.visible = active && animateToggle.checked && showArrowsToggle.checked;

  gaussianSurface.rotation.y = timeSeconds * 0.08;
  surfaceWire.rotation.y = timeSeconds * -0.06;
  surfaceWire.rotation.x = timeSeconds * 0.035;

  arrows.children.forEach((arrow, index) => {
    const baseDirection = arrow.userData.baseDirection.clone().multiplyScalar(directionSign);
    const baseRadius = arrow.userData.baseRadius;
    const pulse = 0.08 * Math.sin(timeSeconds * 3 + index * 0.37);
    const length = (0.25 + 0.25 * strengthScale) * (1 + pulse);
    const originDirection = arrow.userData.baseDirection;

    arrow.position.copy(originDirection.clone().multiplyScalar(baseRadius));
    arrow.setDirection(baseDirection);
    arrow.setLength(active ? length : length * 0.42, 0.13 * strengthScale, 0.075 * strengthScale);

    arrowColor.copy(activeColor).lerp(whiteHot, active ? 0.22 + Math.min(0.45, magnitude * 0.05) : 0.05);
    arrow.setColor(arrowColor);
  });

  pulseParticles.children.forEach((particle, index) => {
    const cycle = (timeSeconds * (0.11 + magnitude * 0.035) + particle.userData.offset) % 1;
    const radius = THREE.MathUtils.lerp(0.58, 3.32, positive ? cycle : 1 - cycle);
    const wobble = 0.035 * Math.sin(timeSeconds * 4 + index);
    particle.position.copy(particle.userData.direction.clone().multiplyScalar(radius + wobble));
    particle.scale.setScalar(0.55 + strengthScale * 0.75 * (1 - Math.abs(cycle - 0.5)));
    particle.material.color.copy(activeColor).lerp(whiteHot, 0.55);
    particle.material.opacity = animateToggle.checked ? 0.18 + 0.58 * Math.sin(Math.PI * cycle) : 0;
  });
}

function resizeRendererToDisplaySize() {
  const { clientWidth, clientHeight } = canvas;
  const needResize = canvas.width !== Math.floor(clientWidth * renderer.getPixelRatio())
    || canvas.height !== Math.floor(clientHeight * renderer.getPixelRatio());

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
equationTabs.forEach((tab) => {
  tab.addEventListener('click', () => setScene(tab.dataset.scene));
});

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
