<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Exemplo 1 – Rotação Interativa (Three.js)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #111; overflow: hidden; }
    canvas { display: block; }
    #info {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      font-size: 15px;
      background: rgba(0, 0, 0, 0.6);
      padding: 8px 20px;
      border-radius: 8px;
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
    }
    #info span { color: #ffdd55; font-weight: bold; }
  </style>
</head>
<body>
  <div id="info">
    <span>← →</span> Rotacionar em Y &nbsp;|&nbsp;
    <span>↑ ↓</span> Rotacionar em X &nbsp;|&nbsp;
    <span>Page Up / Down</span> Zoom
  </div>

  <!-- Biblioteca Three.js baixada localmente (evita problema de CORS ao abrir via file://) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, Window.innerWidth / Window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111);
document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
        renderer.render(scene, camera);
}
animate();

const centro = new THREE.group();
scene.add(centro);

const centroEsq = new THREE.group();
scene.add(centroEsq);

const centroDir = new THREE.group();
scene.add(centroDir);

const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);

const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    new THREE.MeshBasicMaterial({ color: 0x0000ff }),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
];

scene.add(geometry);