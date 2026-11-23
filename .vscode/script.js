import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.perspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 4, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111);
document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(camera);
}
animate();

const cubo = new THREE.cubo(); //Grupo que pega todo o cubo
scene.add(grupo);

const geometry = new THREE.BoxGeometry(3, 3, 3);

// Criar um material para cada face
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Direita (Vermelho)
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Esquerda (Verde)
    new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Topo (Azul)
    new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Base (Amarelo)
    new THREE.MeshBasicMaterial({ color: 0xFFFFFF }), // Frente (Branco)
    new THREE.MeshBasicMaterial({ color: 0xFFA500 })  // Trás (Laranja)
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);