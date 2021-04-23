import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ObstacleController {
    constructor() {
        this.obstacles = [];
        this.speed = 0.1;
        this.obstacleLoader = new GLTFLoader();
    }

    add(scene, position) {
        const cnt = Math.floor(Math.random() * 10);
        for (let i = 0; i < cnt; i++) {
            this.obstacleLoader.setPath('/assets/models/').load('airbomb.glb', gltf => {
                const ob = gltf.scene;
                scene.add(ob);
                this.createObs(ob, position);
            });
        }
    }

    createObs(ob, position) {
        const factor = 80;
        const minusX = Math.random() < 0.5;
        const pos = position.clone();
        pos.x += factor / 3 + Math.round(Math.random() * factor);
        pos.z += factor / 3 + Math.round(Math.random() * factor);
        pos.x = (minusX ? -1 : 1) * pos.x;
        ob.position.set(pos.x, pos.y, pos.z);
        ob.rotation.set(0, Math.PI, 0);
        ob.scale.multiplyScalar(1.2);
        this.obstacles = [...this.obstacles, ob];
    }

    update(pos) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const position = pos.clone();
            const obPos = this.obstacles[i].position.clone();
            obPos.multiplyScalar(-1);
            const x = position.add(obPos);
            x.normalize();
            x.multiplyScalar(this.speed);
            this.obstacles[i].position.add(x);
        }
    }

    remove(to_remove) {
        this.obstacles = this.obstacles.filter(m => !to_remove.includes(m));
    }
}

export default ObstacleController;
