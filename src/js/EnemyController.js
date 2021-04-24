import * as THREE from 'three';
import MissileLauncher from './MissileLauncher';
import ObstacleController from './ObstacleController';

class EnemyController extends ObstacleController {
    constructor(scene, position) {
        super(scene, position);
        this.launcher = new MissileLauncher(scene);
    }

    load(position) {
        this.obstacleLoader.setPath('/assets/models/').load('plane.glb', gltf => {
            this.object = gltf.scene;
            this.addObstacle(position, 2);
        });
    }

    addObstacle(position, count = 2) {
        for (let i = 0; i < count; i++) {
            const enemy = this.object.clone();
            this.scene.add(enemy);
            enemy.position.copy(this.get_pos(position));
            enemy.lookAt(position);
            enemy.scale.multiplyScalar(1.2);
            this.obstacles = [...this.obstacles, { object: enemy, prevTime: Date.now() }];
        }
    }

    get missiles() {
        return this.launcher.missiles;
    }

    remove_missiles(to_remove) {
        this.launcher.remove(to_remove);
    }

    update(pos) {
        const rem_obs = [];
        for (let i = 0; i < this.obstacles.length; i++) {
            const en = this.obstacles[i].object;
            const time = this.obstacles[i].prevTime;
            en.lookAt(pos);
            if (Date.now() - time > 5000) {
                this.obstacles[i].prevTime = Date.now();
                this.launcher.add(en.position.clone(), en.quaternion.clone(), true);
            }
            if (en.position.z < pos.z) {
                rem_obs.push(en);
                this.scene.remove(en);
            }
        }
        this.remove(rem_obs);

        this.launcher.update(pos, false);
        const to_remove_missiles = [];
        for (let i = 0; i < this.launcher.missiles.length; i++) {
            const ms = this.launcher.missiles[i].object;
            if (ms.position.z < pos.z) {
                this.scene.remove(ms);
                to_remove_missiles.push(this.launcher.missiles[i]);
            }
        }
        this.remove_missiles(to_remove_missiles);

        if (this.obstacles.length < 2 && this.object) {
            this.addObstacle(pos, 1);
        }
    }
}

export default EnemyController;
