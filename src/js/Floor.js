import * as THREE from "three";

class Floor {
  constructor(scale, color) {
    const geometry = new THREE.PlaneGeometry(scale, scale);
    const material = new THREE.MeshToonMaterial({ color });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = (-1 * Math.PI) / 2;
    plane.position.y = 0;
    // plane.castShadow = false;
    // plane.receiveShadow = true;
    this.floor = plane;
  }

  get mesh(){
      return this.floor;
  }

}

export default Floor;