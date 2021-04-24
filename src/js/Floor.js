import * as THREE from 'three';

class Floor {
    constructor(scale = 10000, color = '#336633') {
        const geometry = new THREE.PlaneGeometry(100, scale);
        const texture = new THREE.TextureLoader().load('/assets/images/rainbow.jpg');
        const material = new THREE.MeshToonMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = (-1 * Math.PI) / 2;
        plane.position.y = 0;
        // plane.castShadow = false;
        // plane.receiveShadow = true;
        this.floor = plane;
    }

    get mesh() {
        return this.floor;
    }
}

export default Floor;
