import * as THREE from 'three';
import config from '/static/config/config.json';
import SubCube from './subcube'


class Cube {
    constructor(scene) {
        this.scene = scene;
        this.config = config;
        this.groups = {
            U: new THREE.Group(),
            D: new THREE.Group(),
            L: new THREE.Group(),
            R: new THREE.Group(),
            F: new THREE.Group(),
            B: new THREE.Group()
        };
        this.init();
    }

    init() {
        // Create sub-cubes and add them to their respective groups
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {

                    // Skip the invisible center cube
                    if (x === 1 && y === 1 && z === 1) continue;

                    const subCube = new SubCube(x, y, z, this.config.faceColors, this.config.cubeSize, this.config.cubeGap);

                    // Add subCube to the respective groups
                    if (y === 2) this.groups.U.add(subCube.objGroup);
                    if (y === 0) this.groups.D.add(subCube.objGroup);
                    if (x === 0) this.groups.L.add(subCube.objGroup);
                    if (x === 2) this.groups.R.add(subCube.objGroup);
                    if (z === 2) this.groups.F.add(subCube.objGroup);
                    if (z === 0) this.groups.B.add(subCube.objGroup);

                    this.scene.add(subCube.objGroup);
                }
            }
        }

        // Add the groups to the scene
        for (let key in this.groups) {
            this.scene.add(this.groups[key]);
        }
    }

    // Method to get the current state of the Rubik's Cube
    getCubeState() {
        const cubeState = {
            U: [],  // Up face
            D: [],  // Down face
            L: [],  // Left face
            R: [],  // Right face
            F: [],  // Front face
            B: []   // Back face
        };

        // TODO
        return cubeState;
    }

}

export default Cube;