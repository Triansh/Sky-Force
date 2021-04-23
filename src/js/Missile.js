import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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

        let missileLoader = new GLTFLoader();
        missileLoader.setPath('/assets/models/').load('missile.gltf', gltf => {
            const ob = gltf.scene;
            ob.scale.multiplyScalar(0.5);
            ob.applyQuaternion(quaternion);
            scene.add(ob);
            ob.position.copy(position);
            ob.position.add(forward.clone().multiplyScalar(3));
            ob.position.add(side);
            const ob2 = ob.clone();
            ob2.position.add(side.multiplyScalar(-2));
            scene.add(ob);
            scene.add(ob2);
            this.missiles = [...this.missiles, { object: ob, forward }, { object: ob2, forward }];
            // missile.rotation.y = (Math.PI / 2) * 0.25;
            // obstacleController.add(scene, model.position.clone());
            // console.log(model);
        });
        // const size = 0.5;
        // const geometry = new THREE.BoxGeometry(size, size, size);
        // const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        // const ob = new THREE.Mesh(geometry, material);
        // ob.position.copy(position);
        // ob.position.add(side);

        // this.missiles = [...this.missiles, { object: ob, forward }, { object: ob2, forward }];
    }
}
export default MissileLauncher;
