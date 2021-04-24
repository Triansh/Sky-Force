import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class MissileLauncher {
    constructor(scene) {
        this.missiles = []; // {object: '', forward}
        this.speed = 1.4;
        this.missileLoader = new GLTFLoader();
        this.scene = scene;
        this.object = null;
        this.missileLoader
            .setPath('/assets/models/')
            .load('rocket.glb', gltf => (this.object = gltf.scene));
    }

    update(pos, checkdis = true) {
        const to_remove = [];
        for (let i = 0; i < this.missiles.length; i++) {
            const ms = this.missiles[i].object;
            const fw = this.missiles[i].forward;
            ms.position.add(fw);
            if (checkdis && ms.position.distanceTo(pos) > 200) {
                to_remove.push(ms);
                this.scene.remove(ms);
            }
        }
        this.remove(to_remove);
    }

    remove(to_remove) {
        this.missiles = this.missiles.filter(m => !to_remove.includes(m));
    }

    add(position, quaternion, oneOnly = false) {
        if (!this.object) return;

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(quaternion);
        forward.normalize();
        forward.multiplyScalar(this.speed);

        const ob = this.object.clone();
        ob.scale.multiplyScalar(0.5);
        ob.applyQuaternion(quaternion);
        ob.position.copy(position);
        ob.position.add(forward.clone().multiplyScalar(3));

        this.scene.add(ob);
        this.missiles = [...this.missiles, { object: ob, forward }];

        if (!oneOnly) {
            const side = forward.clone();
            side.cross(new THREE.Vector3(0, 1, 0));
            side.normalize().multiplyScalar(1.3);
            ob.position.add(side);

            const ob2 = ob.clone();
            ob2.position.add(side.multiplyScalar(-2));
            this.scene.add(ob2);
            this.missiles = [...this.missiles, { object: ob2, forward }];
        }
    }
}
export default MissileLauncher;
