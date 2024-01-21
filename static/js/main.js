import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { initCube, animateCube, onMouseClick } from './controls.js';


const config = {
    debug: true,

    cubeSize: 0.9,
    cubeGap: 0.1,
    cubeColor: 0xff0000, // Red

    backgroundColor: 0xAAAAAA,

    ambientLightColor: 0x404040,
    ambientLightIntensity: 1,

    directionalLightColor: 0xffffff,
    directionalLightIntensity: 1,
    directionalLightPosition: { x: 0, y: 1, z: 1 },

    cameraPosition: { x: 5, y: 5, z: 5 }
};



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// Event-listener setup
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', event => onMouseClick(event, scene, camera, renderer));
}


// Lighting setup
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(config.ambientLightColor, config.ambientLightIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(config.directionalLightColor, config.directionalLightIntensity);
    directionalLight.position.set(config.directionalLightPosition.x, config.directionalLightPosition.y, config.directionalLightPosition.z);
    scene.add(directionalLight);
}


// Camera setup
function setupCamera(){
    camera.position.set(
        config.cameraPosition.x,
        config.cameraPosition.y,
        config.cameraPosition.z
    );
}


function setupScene() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(config.backgroundColor);
    document.body.appendChild(renderer.domElement);

    setupLighting();
    setupCamera();
    initCube(scene, THREE, config);

    if (config.debug){
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    }

    setupEventListeners();
}


function animate() {
    requestAnimationFrame(animate);
    animateCube();
    controls.update();
    renderer.render(scene, camera);
}


setupScene();
animate();