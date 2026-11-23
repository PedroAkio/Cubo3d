import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.querySelector("#scene");
const statusText = document.querySelector("#statusText");
const moveCountEl = document.querySelector("#moveCount");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10172b);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(5.8, 5.2, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 5;
controls.maxDistance = 12;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xdce5ff, 0x252b43, 2.0));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
keyLight.position.set(5, 8, 6);
keyLight.castShadow = true;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x8294ff, 1.15);
fillLight.position.set(-5, 2, -4);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x111a30, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.15;
floor.receiveShadow = true;
scene.add(floor);

const cubeRoot = new THREE.Group();
scene.add(cubeRoot);
const cubies = [];
const spacing = 1.025;
const cubieSize = 0.98;
const dark = 0x11131a;

const themes = {
  classic: { right: 0xd92d36, left: 0xff8b24, top: 0xf5f5f2, bottom: 0xffd52a, front: 0x20a65a, back: 0x2368dc },
  pastel:  { right: 0xe99aa8, left: 0xf0bd8c, top: 0xf7f0d9, bottom: 0xe8d66d, front: 0x9bc9ad, back: 0x9eb9e8 },
  neon:    { right: 0xff315f, left: 0xff8b28, top: 0xf6f6ff, bottom: 0xf6ec20, front: 0x27f5a5, back: 0x3b83ff }
};
let activeTheme = "classic";

function makeMaterials(x, y, z) {
  const c = themes[activeTheme];
  // Ordem dos materiais da BoxGeometry: +X, -X, +Y, -Y, +Z, -Z.
  return [
    new THREE.MeshStandardMaterial({ color: x === 1 ? c.right : dark, roughness: 0.38 }),
    new THREE.MeshStandardMaterial({ color: x === -1 ? c.left : dark, roughness: 0.38 }),
    new THREE.MeshStandardMaterial({ color: y === 1 ? c.top : dark, roughness: 0.38 }),
    new THREE.MeshStandardMaterial({ color: y === -1 ? c.bottom : dark, roughness: 0.38 }),
    new THREE.MeshStandardMaterial({ color: z === 1 ? c.front : dark, roughness: 0.38 }),
    new THREE.MeshStandardMaterial({ color: z === -1 ? c.back : dark, roughness: 0.38 })
  ];
}

function buildCube() {
  for (const cubie of cubies) cubeRoot.remove(cubie);
  cubies.length = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize),
          makeMaterials(x, y, z)
        );
        mesh.position.set(x * spacing, y * spacing, z * spacing);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.home = new THREE.Vector3(x, y, z);
        mesh.userData.homeStickerNormals = [
          x === 1 ? new THREE.Vector3(1,0,0) : null,
          x === -1 ? new THREE.Vector3(-1,0,0) : null,
          y === 1 ? new THREE.Vector3(0,1,0) : null,
          y === -1 ? new THREE.Vector3(0,-1,0) : null,
          z === 1 ? new THREE.Vector3(0,0,1) : null,
          z === -1 ? new THREE.Vector3(0,0,-1) : null
        ];
        cubeRoot.add(mesh);
        cubies.push(mesh);
      }
    }
  }
}
buildCube();

let moves = 0;
let busy = false;
let animationQueue = [];
const axisFor = {
  U: { axis: new THREE.Vector3(0, 1, 0), layer: 1 },
  D: { axis: new THREE.Vector3(0, 1, 0), layer: -1 },
  R: { axis: new THREE.Vector3(1, 0, 0), layer: 1 },
  L: { axis: new THREE.Vector3(1, 0, 0), layer: -1 },
  F: { axis: new THREE.Vector3(0, 0, 1), layer: 1 },
  B: { axis: new THREE.Vector3(0, 0, 1), layer: -1 }
};

function updateStatus() {
  moveCountEl.textContent = String(moves);
  const solved = isSolved();
  statusText.textContent = solved ? "Cubo resolvido" : "Em andamento";
  document.querySelector(".status-dot").style.background = solved ? "#54d69a" : "#f5c45e";
  document.querySelector(".status-dot").style.boxShadow = solved ? "0 0 12px #54d69a" : "0 0 12px #f5c45e";
}

function isSolved() {
  const tolerance = 0.001;
  for (const cubie of cubies) {
    // A peça precisa estar na posição original e com seus adesivos voltados
    // para as mesmas direções do estado inicial.
    const homePosition = cubie.userData.home.clone().multiplyScalar(spacing);
    if (cubie.position.distanceTo(homePosition) > tolerance) return false;
    const normals = cubie.userData.homeStickerNormals;
    for (let i = 0; i < normals.length; i++) {
      if (!normals[i]) continue;
      const localNormal = [
        new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
        new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
        new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
      ][i];
      const worldNormal = localNormal.clone().applyQuaternion(cubie.quaternion);
      if (worldNormal.distanceTo(normals[i]) > tolerance) return false;
    }
  }
  return true;
}

function enqueueMove(face, inverse = false) {
  if (!axisFor[face]) return;
  animationQueue.push({ face, inverse });
  runQueue();
}

function runQueue() {
  if (busy || animationQueue.length === 0) return;
  busy = true;
  const { face, inverse } = animationQueue.shift();
  animateTurn(face, inverse, () => {
    moves++;
    updateStatus();
    busy = false;
    runQueue();
  });
}

function animateTurn(face, inverse, done) {
  const config = axisFor[face];
  const axis = config.axis.clone();
  const selected = cubies.filter(c => Math.round(c.position.dot(axis)) === config.layer);
  const pivot = new THREE.Group();
  cubeRoot.add(pivot);
  selected.forEach(c => pivot.attach(c));

  const direction = inverse ? -1 : 1;
  const target = direction * Math.PI / 2;
  const duration = 260;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = t * t * (3 - 2 * t);
    pivot.rotation.set(0, 0, 0);
    pivot.rotateOnAxis(axis, target * eased);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      pivot.rotation.set(0, 0, 0);
      pivot.rotateOnAxis(axis, target);
      pivot.updateMatrixWorld(true);
      selected.forEach(c => {
        cubeRoot.attach(c);
        c.position.set(
          Math.round(c.position.x / spacing) * spacing,
          Math.round(c.position.y / spacing) * spacing,
          Math.round(c.position.z / spacing) * spacing
        );
        const e = new THREE.Euler().setFromQuaternion(c.quaternion, "XYZ");
        e.set(
          Math.round(e.x / (Math.PI / 2)) * (Math.PI / 2),
          Math.round(e.y / (Math.PI / 2)) * (Math.PI / 2),
          Math.round(e.z / (Math.PI / 2)) * (Math.PI / 2)
        );
        c.quaternion.setFromEuler(e);
      });
      cubeRoot.remove(pivot);
      done();
    }
  }
  requestAnimationFrame(frame);
}

document.querySelectorAll("[data-move]").forEach(button => {
  button.addEventListener("click", () => enqueueMove(button.dataset.move, false));
});

document.addEventListener("keydown", event => {
  if (event.repeat || event.target.matches("input, textarea, select")) return;
  const key = event.key.toUpperCase();
  if (axisFor[key]) {
    event.preventDefault();
    enqueueMove(key, event.shiftKey);
  }
});

document.querySelector("#scrambleBtn").addEventListener("click", () => {
  if (busy || animationQueue.length) return;
  const faces = Object.keys(axisFor);
  let previous = "";
  const sequence = [];
  for (let i = 0; i < 20; i++) {
    let face;
    do { face = faces[Math.floor(Math.random() * faces.length)]; } while (face === previous);
    previous = face;
    sequence.push({ face, inverse: Math.random() < 0.5 });
  }
  animationQueue.push(...sequence);
  runQueue();
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  animationQueue.length = 0;
  if (busy) {
    // O reinício aguarda o movimento atual terminar para não interromper a transformação.
    const wait = setInterval(() => {
      if (!busy) {
        clearInterval(wait);
        resetCube();
      }
    }, 30);
  } else resetCube();
});

function resetCube() {
  cubies.forEach(c => cubeRoot.remove(c));
  cubies.length = 0;
  buildCube();
  moves = 0;
  updateStatus();
}

function applyTheme(name) {
  activeTheme = name;
  const positions = cubies.map(c => c.position.clone());
  const quaternions = cubies.map(c => c.quaternion.clone());
  cubies.forEach(c => cubeRoot.remove(c));
  cubies.length = 0;
  buildCube();
  // Mantém a posição e a orientação de cada cubinho ao trocar o tema.
  cubies.forEach((c, i) => {
    c.position.copy(positions[i]);
    c.quaternion.copy(quaternions[i]);
  });
  document.querySelectorAll(".theme-choice").forEach(b => b.classList.toggle("active", b.dataset.theme === name));
}
document.querySelectorAll(".theme-choice").forEach(button => {
  button.addEventListener("click", () => {
    if (!busy && animationQueue.length === 0) applyTheme(button.dataset.theme);
  });
});

function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
new ResizeObserver(resize).observe(container);
resize();

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}
render();
updateStatus();
