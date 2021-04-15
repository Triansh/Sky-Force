import * as THREE from "three";

export const makeCube = (position = new THREE.Vector3(0, 0, 0), scale = 100, color = "#00ff00") => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cube = new THREE.Mesh(geometry, material);
  cube.scale.multiplyScalar(scale);
  cube.position.x = position.x;
  cube.position.y = position.y;
  cube.position.z = position.z;
  return cube;
};

export default makeCube;
