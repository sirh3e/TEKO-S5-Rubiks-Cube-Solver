import * as THREE from 'three';
import config from '../config/config.json';
import SubCube from './subcube'
import SubBall from "./subBall";
import gsap from 'gsap';


class Cube {
    constructor(scene) {
        this.scene = scene;
        this.config = config;
        this.masterGroup = new THREE.Group();
        this.rotationGroup = new THREE.Group();

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
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                for (let z = -1; z < 2; z++) {
                    if (x === 0 && y === 0 && z === 0) continue;

                    const subBall = new SubBall(x, y, z, this.config.cubeSize);
                    this.scene.add(subBall.object);
                }
            }
        }

        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                for (let z = -1; z < 2; z++) {
                    if (x === 0 && y === 0 && z === 0) continue;

                    const subCube = new SubCube(x, y, z, this.config.faceColors, this.config.cubeSize, this.config.cubeGap, this.scene);

                    this.masterGroup.add(subCube.objGroup);

                    // Add subCube references and vectors to the logical (shadow-) groups
                    if (x === -1) this.groups.L.push(subCube);
                    if (x === 1) this.groups.R.push(subCube);
                    if (y === -1) this.groups.D.push(subCube);
                    if (y === 1) this.groups.U.push(subCube);
                    if (z === -1) this.groups.B.push(subCube);
                    if (z === 1) this.groups.F.push(subCube);
                }
            }
        }

        this.scene.add(this.masterGroup);
    }

    // Method to get the current state of the Rubik's Cube
    getCubeState() {
        let cubeState = new Array(54);

        for (const group of Object.values(this.groups)) {
            for (const subCube of group) {
                subCube.updateFaceColors();

                for (const faceMesh of subCube.objGroup.children) {
                    if (faceMesh.userData.faceColorName !== 'default') {
                        // Create a string representation of the current item
                        const currentItem = JSON.stringify([faceMesh.userData.faceColorName, faceMesh.userData.side, faceMesh.userData.position]);

                        // Check if the array already contains an identical item as most faces share a subCube
                        const alreadyExists = cubeState.some(item => JSON.stringify(item) === currentItem);

                        if (!alreadyExists) {
                            if (faceMesh.userData.position) {
                                const faceListIndex = cubeStateMapping[faceMesh.userData.position][faceMesh.userData.side.toUpperCase()];
                                cubeState[faceListIndex] = faceMesh.userData.faceColorName[0];  // only store first letter of color
                            }
                            else { // todo: fix ray casting for this face with position null
                                cubeState[cubeStateMapping["0.-1.0"][faceMesh.userData.side.toUpperCase()]] = faceMesh.userData.faceColorName[0]
                            }
                        }
                    }
                }
            }
        }

        return cubeState.join("").toUpperCase();
    }

    rotateFace(moveCommand) {
        // reset rotation of group
        this.rotationGroup.rotation.set(0, 0, 0);

        // (re-)add the empty group to the scene
        this.scene.add(this.rotationGroup);

        // add sub cubes of face to a group
        const face = moveCommand[0].toUpperCase();  // face is the first letter of a command

        try {
            for (const subCube of this.groups[face]) {
                this.rotationGroup.add(subCube.objGroup);
            }
        } catch {
            console.error(`There is no face '${face}'!`);
            return;
        }

        // Determine the axis and angle for rotation
        let axis = 'y', angle = Math.PI / 2; // Default values
        switch (moveCommand.toUpperCase()) {
            case "U":
            case "D'":
                axis = 'y';
                angle = -Math.PI / 2;
                break;
            case "U'":
            case "D":
                axis = 'y';
                angle = Math.PI / 2;
                break;
            case "L'":
            case "R":
                axis = 'x';
                angle = -Math.PI / 2;
                break;
            case "L":
            case "R'":
                axis = 'x';
                angle = Math.PI / 2;
                break;
            case "F":
            case "B'":
                axis = 'z';
                angle = -Math.PI / 2;
                break;
            case "F'":
            case "B":
                axis = 'z';
                angle = Math.PI / 2;
                break;
            // Handle double turns as needed
        }

        // Perform the rotation using GSAP 3 for smooth animation
        gsap.to(this.rotationGroup.rotation, {
            duration: 0.3,
            [axis]: `+=${angle}`,
            onComplete: () => {
                // Update the world matrix of the group after rotating
                this.rotationGroup.updateMatrixWorld();

                // Dissolve the group
                while (this.rotationGroup.children.length > 0) {
                    const child = this.rotationGroup.children[0];
                    child.applyMatrix4(this.rotationGroup.matrixWorld);
                    this.masterGroup.add(child);
                    this.rotationGroup.remove(child);
                }

                // Remove the group from the scene
                this.scene.remove(this.rotationGroup);

                // Remap logical groups
                this.remapSubCubesToGroups();
            }
        });
    }

    remapSubCubesToGroups() {
        // clear the current groups
        Object.keys(this.groups).forEach(key => {
            this.groups[key] = [];
        });

        // iterate over all subcubes in the masterGroup
        this.masterGroup.children.forEach(subCube => {
            const subCubeInstance = subCube.userData.subCubeInstance;
            const { x, y, z } = subCube.position;

            // update the logical coordinates
            subCubeInstance.x = x
            subCubeInstance.y = y
            subCubeInstance.z = z

            // add subCube references to the logical groups based on their position
            // TODO: change the <= and >= once we no longer use the gaps
            if (x <= -1) this.groups.L.push(subCubeInstance);
            if (x >= 1) this.groups.R.push(subCubeInstance);
            if (y <= -1) this.groups.D.push(subCubeInstance);
            if (y >= 1) this.groups.U.push(subCubeInstance);
            if (z <= -1) this.groups.B.push(subCubeInstance);
            if (z >= 1) this.groups.F.push(subCubeInstance);
        });
    }
}

export default Cube;
