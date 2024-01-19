import * as THREE from 'three';


let selectedCube = null; // Stores the currently selected sub-cube


export function initCube(scene, THREE, config) {
    // Predefined geometry for all sub-cubes
    const cubeGeometry = new THREE.BoxGeometry(config.cubeSize, config.cubeSize, config.cubeSize);

    // Loop to create each sub-cube
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                const material = new THREE.MeshStandardMaterial({ color: config.cubeColor });
                const cube = new THREE.Mesh(cubeGeometry, material);
                // Position each cube based on its index and the gap
                cube.position.set(
                    x - 1 + x * config.cubeGap,
                    y - 1 + y * config.cubeGap,
                    z - 1 + z * config.cubeGap
                );
                cube.name = `subCube-${x}-${y}-${z}`; // Unique name for each sub-cube
                scene.add(cube);
            }
        }
    }
}


export function onMouseClick(event, scene, camera) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Convert the mouse position to normalized device coordinates (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersected by the ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;

        // Check if the intersected object is a sub-cube
        if (hitObject.name.startsWith('subCube')) {
            if (selectedCube) {
                selectedCube.material.emissive.setHex(0x000000); // Deselect previous cube
            }
            selectedCube = hitObject;
            selectedCube.material.emissive.setHex(0xff0000); // Highlight selected cube
        }
    } else {
        // Clicked elsewhere, deselect the selected sub-cube
        if (selectedCube) {
            selectedCube.material.emissive.setHex(0x000000);
            selectedCube = null;
        }
    }
}


export function animateCube() {
    // Add any animations or updates here if needed
}