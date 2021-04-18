import * as THREE from 'three';

class ScoreController {
    constructor() {
        this.score = 0;
        this.stars = [];
        this.scoreFactor = 50;
    }

    addStar(scene, pos, color = '#ffff00') {
        const characterSize = 5;
        var geometry = new THREE.BoxGeometry(characterSize, characterSize, characterSize);
        var material = new THREE.MeshPhongMaterial({ color });
        const star = new THREE.Mesh(geometry, material);
        star.position.copy(pos);
        scene.add(star);
        this.stars = [...this.stars, star];
    }

    remove(to_remove) {
        this.score += this.scoreFactor * to_remove.length;
        document.querySelector('.score').innerHTML = this.score.toString();
        this.stars = this.stars.filter(m => !to_remove.includes(m));
    }
}

export default ScoreController;
