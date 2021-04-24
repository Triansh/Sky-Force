import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ObstacleController {
    constructor(scene, position) {
        this.obstacles = [];
        this.speed = 0.3;
        this.scene = scene;
        this.objects = [];
        this.obstacleLoader = new GLTFLoader();
        this.obstacleLoader.setPath('/assets/models/');
        this.obstacleLoader.load('airbomb.glb', gltf => {
            this.objects.push(gltf.scene);
            this.add(position, 8, gltf.scene);
        });
        this.obstacleLoader.load('plane.glb', gltf => {
            this.objects.push(gltf.scene);
            this.add(position, 2, gltf.scene);
        });
    }

    add(position, count = 12, obj) {
        for (let i = 0; i < count; i++) {
            const ob = obj.clone();
            this.scene.add(ob);
            ob.position.copy(this.get_pos(position));
            ob.rotation.set(0, Math.PI, 0);
            ob.scale.multiplyScalar(1.2);
            this.obstacles = [...this.obstacles, ob];
        }
    }

    get_pos(position) {
        const factorX = 110;
        const factorZ = 200;
        const minusX = Math.random() < 0.5;
        const pos = position.clone();
        pos.x += factorX / 3 + Math.round(Math.random() * factorX);
        pos.z += factorZ / 3 + Math.round(Math.random() * factorZ);
        pos.x = (minusX ? -1 : 1) * pos.x;
        return pos;
    }

    update(pos) {
        const to_remove = [];
        for (let i = 0; i < this.obstacles.length; i++) {
            const position = pos.clone();
            const ob = this.obstacles[i];
            const obPos = ob.position.clone();
            obPos.multiplyScalar(-1);
            const x = position.add(obPos);
            x.normalize();
            x.multiplyScalar(this.speed);
            ob.position.add(x);
            if (ob.position.z < pos.z) {
                to_remove.push(ob);
                this.scene.remove(ob);
            }
        }
        this.remove(to_remove);

        if (this.obstacles.length < 6 && this.objects[1]) {
            this.add(pos, 1, this.objects[Math.random() < 0.5 ? 0 : 1]);
        }
    }

    remove(to_remove) {
        this.obstacles = this.obstacles.filter(m => !to_remove.includes(m));
    }
}

export default ObstacleController;
