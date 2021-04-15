import * as THREE from "three";

export const makeLines = (scene, position) => {
  const material_x = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const material_y = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const material_z = new THREE.LineBasicMaterial({ color: 0x0000ff });

  const points_x = [],
    points_y = [],
    points_z = [];
  const length = 1000000;
  points_x.push(new THREE.Vector3(position.x - length, position.y, position.z));
  points_x.push(new THREE.Vector3(position.x + length), position.y, position.z);
  points_y.push(new THREE.Vector3(position.x, position.y - length, position.z));
  points_y.push(new THREE.Vector3(position.x, position.y + length, position.z));
  points_z.push(new THREE.Vector3(position.x, position.y, position.z - length));
  points_z.push(new THREE.Vector3(position.x, position.y, position.z + length));

  const geometry_x = new THREE.BufferGeometry().setFromPoints(points_x);
  const geometry_y = new THREE.BufferGeometry().setFromPoints(points_y);
  const geometry_z = new THREE.BufferGeometry().setFromPoints(points_z);

  const line_x = new THREE.Line(geometry_x, material_x);
  const line_y = new THREE.Line(geometry_y, material_y);
  const line_z = new THREE.Line(geometry_z, material_z);
  scene.add(line_x);
  scene.add(line_y);
  scene.add(line_z);
};

export default makeLines;
