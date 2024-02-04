import * as THREE from 'three';
import config from '../config/config.json';
import SubCube from './subcube'


class Cube {
    constructor(scene) {
        this.scene = scene;
        this.config = config;
        this.masterGroup = new THREE.Group();

        this.groups = {
            U: [],
            D: [],
            L: [],
            R: [],
            F: [],
            B: []
        };

        this.faceMapping = {
            U: 'up',
            D: 'down',
            L: 'left',
            R: 'right',
            F: 'front',
            B: 'back'
        };

        this.init();
    }

    init() {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    if (x === 1 && y === 1 && z === 1) continue;

                    const subCube = new SubCube(x, y, z, this.config.faceColors, this.config.cubeSize, this.config.cubeGap);
                    this.masterGroup.add(subCube.objGroup);

                    // Add subCube references to the logical groups
                    if (x === 0) this.groups.L.push(subCube);
                    if (x === 2) this.groups.R.push(subCube);
                    if (y === 0) this.groups.D.push(subCube);
                    if (y === 2) this.groups.U.push(subCube);
                    if (z === 0) this.groups.B.push(subCube);
                    if (z === 2) this.groups.F.push(subCube);
                }
            }
        }

        this.scene.add(this.masterGroup);
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

        Object.keys(this.groups).forEach(group => {
            this.groups[group].forEach(subCubeGroup => {
                if(subCubeGroup.objGroup.userData.subCubeInstance){
                    const subCube = subCubeGroup.objGroup.userData.subCubeInstance;
                    const faceColor = subCube.faces[this.faceMapping[group]].userData.faceColorName;
                    cubeState[group].push(faceColor);
                }
            });
        });

        return cubeState;
    }

    // TODO: Check if this actually works...
    setCubeState(newState) {
        Object.keys(this.groups).forEach(group => {
            this.groups[group].forEach((subCube, index) => {
                const faceDirection = this.faceMapping[group];
                const newColorName = newState[group][index];
                const newColorValue = this.config.faceColors[newColorName];

                if (subCube.faces[faceDirection]) {
                    // Update the material of the corresponding face
                    subCube.faces[faceDirection].material.color.set(newColorValue);
                    // Update the userData with the new color name
                    subCube.faces[faceDirection].userData.faceColorName = newColorName;
                }
            });
        });
    }

}

export default Cube;