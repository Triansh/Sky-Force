import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ScoreController {
    constructor(scene) {
        this.score = 0;
        this.stars = [];
        this.scoreFactor = 50;
        this.scene = scene;
        this.object = null;
        this.obstacleLoader = new GLTFLoader();
        this.obstacleLoader.setPath('/assets/models/').load('star.glb', gltf => {
            this.object = gltf.scene;
        });
    }

    addStar(pos) {
        if (!this.object) return;
        const star = this.object.clone();
        this.scene.add(star);
        star.position.copy(pos);
        star.scale.multiplyScalar(4);
        this.stars = [...this.stars, star];
    }

    remove(to_remove) {
        this.score += this.scoreFactor * to_remove.length;
        document.querySelector('.score').innerHTML = this.score.toString();
        this.stars = this.stars.filter(m => !to_remove.includes(m));
    }
}

export default ScoreController;
