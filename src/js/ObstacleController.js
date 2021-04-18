import * as THREE from 'three';

class ObstacleController {
    constructor() {
        this.obstacles = [];
        this.speed = 0.1;
    }

    add(scene, position) {
        const cnt = Math.floor(Math.random() * 20);
        console.log(cnt);
        for (let i = 0; i < cnt; i++) {
            this.createObs(scene, position);
        }
    }

    createObs(scene, pos, color = '#ff00ff') {
        const characterSize = 5;
        const factor = 150;
        var geometry = new THREE.BoxGeometry(characterSize, characterSize, characterSize);
        var material = new THREE.MeshPhongMaterial({ color });
        const ob = new THREE.Mesh(geometry, material);

        const minusX = Math.random() < 0.5;
        const minusZ = Math.random() <= 0.5;
        pos.x += Math.round(Math.random() * factor);
        pos.z += Math.round(Math.random() * factor);
        pos.x = (minusX ? -1 : 1) * pos.x;
        pos.z = (minusZ ? -1 : 1) * pos.z;

        ob.position.set(pos.x, characterSize / 2 + pos.y, pos.z);

        scene.add(ob);
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
