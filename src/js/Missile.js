import * as THREE from 'three';

class MissileLauncher {
    constructor() {
        this.missiles = []; // {object: '', forward}
        this.speed = 0.8;
    }

    move(missile) {
        const mss = this.missiles.filter(m => m.object === missile);
        for (let m in mss) {
            m.object.position.add(m.forward);
        }
        // const to_remove = [];
        // for (let i = 0; i < this.missiles.length; i++) {
        //     // if (detectCollisions(this.missiles[i].object)) {
        //     // scene.remove(this.missiles[i].object);
        //     // to_remove.push(this.missiles[i].object);
        //     // } else {
        //     this.missiles[i].object.position.add(this.missiles[i].forward);
        //     // }
        // }
        // this.missiles = this.missiles.filter(m => !to_remove.includes(m));
    }

    // get mis

    remove(to_remove) {
        this.missiles = this.missiles.filter(m => !to_remove.includes(m));
    }

    add(scene, position, quaternion) {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(quaternion);
        forward.normalize();
        forward.multiplyScalar(this.speed);
        const side = forward.clone();
        side.cross(new THREE.Vector3(0, 1, 0));
        side.normalize();
        side.multiplyScalar(1.3);

        const size = 0.5;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const ob = new THREE.Mesh(geometry, material);
        ob.position.copy(position);
        ob.position.add(side);
        const ob2 = ob.clone();
        ob2.position.add(side.multiplyScalar(-2));
        scene.add(ob);
        scene.add(ob2);
        this.missiles = [...this.missiles, { object: ob, forward }, { object: ob2, forward }];
    }
}
export default MissileLauncher;
