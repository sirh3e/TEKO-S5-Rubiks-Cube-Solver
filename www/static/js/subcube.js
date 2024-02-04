import * as THREE from 'three';
import { FaceDirection } from './face.js'

class SubCube {
    constructor(x, y, z, faceColors, cubeSize, cubeGap) {
        this.objGroup = new THREE.Group();
        this.objGroup.userData.isSubCube = true;
        this.objGroup.userData.subCubeInstance = this;

        // these are the static cubes (in the middle of each layer) [x, y, z]
        this.staticCubes = [
            [1,1,2],
            [2,1,1],
            [1,1,0],
            [0,1,1],
            [1,2,1],
            [1,0,1],
        ]

        this.faces = {
            front: null,
            back: null,
            up: null,
            down: null,
            right: null,
            left: null,
        };

        this.x = x;
        this.y = y;
        this.z = z;

        this.faceColors = faceColors;

        this.init(faceColors, cubeSize, cubeGap);
    }

    init(faceColors, cubeSize, cubeGap) {
        for (let i = 0; i < 6; i++) {
            const face = this.createFace(i, faceColors, cubeSize);
            this.objGroup.add(face);
        }

        this.objGroup.position.set(
            this.x - 1 + this.x * cubeGap,
            this.y - 1 + this.y * cubeGap,
            this.z - 1 + this.z * cubeGap
        );
    }

    createFace(index, faceColors, cubeSize) {
        const color = this.getFaceColor(index, faceColors)
        const faceGeometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
        const faceMaterial = new THREE.MeshStandardMaterial({
            color: color.hex,
            side: THREE.DoubleSide
        });

        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);

        faceMesh.userData.faceColorName = color.name;
        faceMesh.userData.faceIndex = index;
        faceMesh.userData.parentSubCube = this;

        switch (index) {
            case FaceDirection.FRONT:
                faceMesh.position.z = cubeSize / 2;
                this.faces.front = faceMesh;
                break;
            case FaceDirection.BACK:
                faceMesh.position.z = -cubeSize / 2;
                faceMesh.rotation.y = Math.PI;
                this.faces.back = faceMesh;
                break;
            case FaceDirection.UP:
                faceMesh.position.y = cubeSize / 2;
                faceMesh.rotation.x = -Math.PI / 2;
                this.faces.up = faceMesh;
                break;
            case FaceDirection.DOWN:
                faceMesh.position.y = -cubeSize / 2;
                faceMesh.rotation.x = Math.PI / 2;
                this.faces.down = faceMesh;
                break;
            case FaceDirection.RIGHT:
                faceMesh.position.x = cubeSize / 2;
                faceMesh.rotation.y = -Math.PI / 2;
                this.faces.right = faceMesh;
                break;
            case FaceDirection.LEFT:
                faceMesh.position.x = -cubeSize / 2;
                faceMesh.rotation.y = Math.PI / 2;
                this.faces.left = faceMesh;
                break;
        }

        return faceMesh;
    }

    getFaceColor(index, faceColors) {
        let colorValue;

        switch (index) {
            case FaceDirection.FRONT:
                colorValue = this.z === 2 ? faceColors.red : faceColors.default;
                break;
            case FaceDirection.BACK:
                colorValue = this.z === 0 ? faceColors.orange : faceColors.default;
                break;
            case FaceDirection.UP:
                colorValue = this.y === 2 ? faceColors.white : faceColors.default;
                break;
            case FaceDirection.DOWN:
                colorValue = this.y === 0 ? faceColors.yellow : faceColors.default;
                break;
            case FaceDirection.RIGHT:
                colorValue = this.x === 2 ? faceColors.blue : faceColors.default;
                break;
            case FaceDirection.LEFT:
                colorValue = this.x === 0 ? faceColors.green : faceColors.default;
                break;
            default:
                colorValue = faceColors.default;
                break;
        }

        return {
            name: Object.keys(faceColors)[index],
            hex: colorValue
        };
    }

    getNextFaceColorByName(faceColorName) {
        // Find the position of the current color inside the faceColors object
        const currentIndex = Object.keys(this.faceColors).indexOf(faceColorName);
        const nextIndex = (currentIndex + 1) % (Object.keys(this.faceColors).length - 1);

        // Get the value of the next color
        const nextColorName = Object.keys(this.faceColors)[nextIndex];
        const nextColorValue = this.faceColors[nextColorName];

        return {
            name: nextColorName,
            hex: nextColorValue
        };
    }

    changeFaceColor(faceIndex) {
        // Find the specific face mesh using the faceIndex
        const faceMesh = this.objGroup.children.find(mesh => mesh.userData.faceIndex === faceIndex);

        if (faceMesh){
            // Get the current and new colors
            const currentFaceColorName = faceMesh.userData.faceColorName;
            const newFaceColor = this.getNextFaceColorByName(currentFaceColorName)

            // Get the coordinates of the cube
            const cubeCoordinates = JSON.stringify([
                faceMesh.parent.userData.subCubeInstance.x,
                faceMesh.parent.userData.subCubeInstance.y,
                faceMesh.parent.userData.subCubeInstance.z
            ]);

            // Check if cube is static (middle of each layer)
            const cubeIsStatic = this.staticCubes.some(arr => JSON.stringify(arr) === cubeCoordinates);

            if (!cubeIsStatic) {
                // Create a new material with the desired color and make it double-sided
                // Replace the existing material of the face with the new material
                faceMesh.material = new THREE.MeshStandardMaterial({ color: newFaceColor.hex, side: THREE.DoubleSide });
                faceMesh.userData.faceColorName = newFaceColor.name;
            }
        }
    }

}

export default SubCube;