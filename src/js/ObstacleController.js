import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ObstacleController {
    constructor() {
        this.obstacles = [];
        this.speed = 0.1;
        this.obstacleLoader = new GLTFLoader();
    }

    add(scene, position) {
        const cnt = Math.floor(Math.random() * 20);
        console.log(cnt);
        for (let i = 0; i < cnt; i++) {
            this.createObs(scene, position);
        }
    }

    createObs(scene, pos, color = '#ff00ff') {
        this.obstacleLoader.setPath('/assets/models/').load('airbomb.glb', gltf => {
            const ob = gltf.scene;
            scene.add(ob);

            const factor = 100;
            const minusX = Math.random() < 0.5;
            pos.x += factor / 3 + Math.round(Math.random() * factor);
            pos.z += factor / 3 + Math.round(Math.random() * factor);
            pos.x = (minusX ? -1 : 1) * pos.x;
            ob.position.set(pos.x, pos.y, pos.z);
            ob.scale.multiplyScalar(1.3);
            this.obstacles = [...this.obstacles, ob];
        });
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
