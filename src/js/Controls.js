import Keyboard from "./Keyboard";
import * as THREE from "three";

class CharacterControls {
  constructor(params) {
    this._keyboard = new Keyboard();
    this._params = params;
    this._move = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);
  }

  move() {
    // console.log("hi");
    // console.log(this._keys);
    // console.log(this._keys[38], this._keys[37]);
    const speed = .5;
    if (this._keyboard._keys[38]) {
      // up
      this._params.target.position.z += speed;
    }
    if (this._keyboard._keys[40]) {
      // down
      this._params.target.position.z -= speed;
    }
    if (this._keyboard._keys[39]) {
      // right
      this._params.target.position.x += speed;
    }
    if (this._keyboard._keys[37]) {
      //left
      this._params.target.position.x -= speed;
    }
  }

  Update(timeInSeconds) {
    // this.move();
    
    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._params.target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    if (this._keyboard._keys[38]) {
      velocity.z += this._acceleration.z * timeInSeconds;
    }
    if (this._keyboard._keys[40]) {
      velocity.z -= this._acceleration.z * timeInSeconds;
    }
    if (this._keyboard._keys[39]) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._keyboard._keys[37]) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    oldPosition.copy(controlObject.position);
    
  }
}

export default CharacterControls;
