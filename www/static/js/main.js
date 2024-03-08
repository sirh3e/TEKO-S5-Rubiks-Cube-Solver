import * as THREE from 'three';
import * as wasm from "wasm-rubiks-cube-solver";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { initCube, animateCube, onMouseClick } from './controls.js';
import { initSteps, convertMovesToSteps } from './steps.js';
import { Skybox } from './skybox';
import config from '../config/config.json';
import gsap from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable anti-aliasing
const composer = new EffectComposer(renderer);
const controls = new OrbitControls(camera, renderer.domElement);
const skyBox = new Skybox(scene);  // eslint-disable-line no-unused-vars
let cube = initCube(scene);
let stepsState = initSteps(convertMovesToSteps(["L", "R", "U2", "R'"]));

// button bindings
document.getElementById("start").addEventListener("click", async () => {
    let moves;
    while ((moves = stepsState.undo()) != null) {
        for (const move of moves) {
            await cube.rotateFace(move);
            setActiveStep(stepsState);
        }
    }
});

document.getElementById("prev").addEventListener("click", async () => {
    if(gsap.isTweening(cube.rotationGroup.rotation)){
        return;
    }

    let moves = stepsState.undo();
    if (moves == null) {
        return;
    }
    for (const move of moves) {
        await cube.rotateFace(move);
        setActiveStep(stepsState);
    }
});

document.getElementById("play").addEventListener("click", async () => {
    if(gsap.isTweening(cube.rotationGroup.rotation)){
        return;
    }

    let move;
    while  ((move = stepsState.do()) != null)  {
        await new Promise(resolve => setTimeout(resolve, config.timeout));
        await cube.rotateFace(move);
        setActiveStep(stepsState);
    }
});

document.getElementById("next").addEventListener("click", async () => {
    if(gsap.isTweening(cube.rotationGroup.rotation)){
        return;
    }

    let move = stepsState.do();
    if (move == null) {
        return;
    }
    await cube.rotateFace(move);
    setActiveStep(stepsState);
});

document.getElementById("end").addEventListener("click", async () => {
    let move;
    while  ((move = stepsState.do()) != null)  {
        await cube.rotateFace(move);
        setActiveStep(stepsState);
    }
});

document.getElementById("reset").addEventListener("click", () => {
    scene.remove(cube.masterGroup);
    const stepsSpan = document.getElementById('steps');
    while (stepsSpan.firstChild) {
        stepsSpan.removeChild(stepsSpan.lastChild);
    }
    cube = initCube(scene);
    stepsState = initSteps();
});

document.getElementById("solve").addEventListener("click", () => {
    const cubeState = cube.getCubeState();
    let moves;

    try {
        moves = wasm.solve_cube(cubeState);
    } catch (error) {
        alert(error);
    }

    const steps = convertMovesToSteps(moves);
    stepsState.setSteps(steps);

    const stepsSpan = document.getElementById('steps');
    stepsState.steps.forEach(step => {
        const stepSpan = document.createElement('span');
        stepSpan.innerText = `${step.move} `;
        stepsSpan.appendChild(stepSpan);
    });

    setActiveStep(stepsState);

    if (config.debug) {
        console.log(JSON.stringify(steps));
    }
});

function setActiveStep(stepsState) {
    const stepsSpan = document.getElementById('steps');

    const children = Array.from(stepsSpan.children);
    children.forEach(child => child.classList.remove('step-active'));

    if (stepsSpan.children[stepsState.index - 1]) {
        stepsSpan.children[stepsState.index - 1].classList.add('step-active');
    }
}

function onWindowResize() {
    // Update the camera's aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer and composer sizes
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
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
function setupCamera() {
    camera.position.set(
        config.cameraPosition.x,
        config.cameraPosition.y,
        config.cameraPosition.z
    );
}

// Scene setup
function setupScene() {
    renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size
    renderer.setClearColor(config.backgroundColor); // Set clear color for the renderer

    document.body.appendChild(renderer.domElement);

    setupLighting();
    setupCamera();

    if (config.debug) {
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    }

    setupEventListeners();

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
}

function animate() {
    requestAnimationFrame(animate);
    animateCube();
    controls.update();
    renderer.render(scene, camera);

    // Render the scene using the composer
    composer.render();
}

setupScene();
animate();
