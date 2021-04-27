import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ObstacleController {
    constructor(scene, position) {
        this.obstacles = [];
        this.speed = 0.3;
        this.scene = scene;
        this.object = null;
        this.obstacleLoader = new GLTFLoader();
        this.load(position);
    }

    load(position) {
        this.obstacleLoader.setPath('/assets/models/').load('airbomb.glb', gltf => {
            this.object = gltf.scene;
            this.addObstacle(position, 7);
        });
    }

    addObstacle(position, count = 12) {
        for (let i = 0; i < count; i++) {
            const ob = this.object.clone();
            this.scene.add(ob);
            ob.position.copy(this.get_pos(position));
            ob.rotation.set(0, Math.PI, 0);
            ob.scale.multiplyScalar(1.2);
            this.obstacles = [...this.obstacles, ob];
        }
    }

    get_random(min, max) {
        return Math.random() * (max - min) + min;
    }

    get_pos(position) {
        const minusX = Math.random() < 0.5;
        const pos = position.clone();
        pos.x += this.get_random(100, 150);
        pos.z += this.get_random(200, 300);
        pos.x = (minusX ? -1 : 1) * pos.x;
        return pos;
    }

    update(pos) {
        const rem_obs = [];
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
                rem_obs.push(ob);
                this.scene.remove(ob);
            }
        }

        if (this.obstacles.length < 4 && this.object) {
            this.addObstacle(pos, 1);
        }
    }

    remove(rem_obs) {
        this.obstacles = this.obstacles.filter(m => !rem_obs.includes(m));
    }
}

export default ObstacleController;
