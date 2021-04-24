import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import { AnimatedObject } from './js/FSM';
import Keyboard from './js/Keyboard';

import Floor from './js/Floor';
import { makeLines } from './js/makeLines';

import MissileLauncher from './js/MissileLauncher';
import ObstacleController from './js/ObstacleController';
import ScoreController from './js/ScoreController';
import EnemyController from './js/EnemyController';

import {
    KEY_BACKWARD,
    KEY_FORWARD,
    KEY_LEFT,
    KEY_RIGHT,
    KEY_SHOOT,
    KEY_TURN_LEFT,
    KEY_TURN_RIGHT,
} from './js/keys';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = false;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor('#bffffd', 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera, Scene , Controls
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);

// Helper Classes
const keyboard = new Keyboard();
const missileLauncher = new MissileLauncher(scene);
const obstacleController = new ObstacleController(scene, new THREE.Vector3(0, 8, -75));
const scoreController = new ScoreController(scene);
const enemyController = new EnemyController(scene, new THREE.Vector3(0, 8, -75));

let plane;
let prevTime = null;
let planeAnimator;
let playerHealth = 100000;
let gameOver = false;

// Audio
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
const sound1 = new THREE.PositionalAudio(listener);
audioLoader.load('/assets/audio/plane.mp3', function (buffer) {
    sound1.setBuffer(buffer);
    sound1.setRefDistance(20);
    sound1.setLoop(true);
    sound1.setVolume(0.4);
    // sound1.play();
});

const YPos = 8;

function init() {
    const video = document.getElementById('video');
    const texture = new THREE.VideoTexture(video);
    scene.background = texture;
    scene.fog = new THREE.FogExp2('#ccff', 0.008);
    camera.add(listener);
    camera.position.set(14, 22, -18);
    camera.lookAt(9, YPos, 10);
    // const floor = new Floor();
    // scene.add(floor.mesh);
    setupControls();
}

function setLight() {
    let l = new THREE.AmbientLight(0xffffff, 2);
    scene.add(l);
}

function setupControls() {
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxDistance = 1000;
    controls.minDistance = 10;
    controls.target.copy(new THREE.Vector3(0, 0, 0));
}

function loadGLTF() {
    const planeLoader = new GLTFLoader();

    planeLoader.load('/assets/models/toyPlane.glb', gltf => {
        plane = gltf.scene;
        scene.add(plane);
        plane.position.set(0, 8, -75);
        makeLines(scene, plane.position);
        plane.scale.multiplyScalar(2);
        plane.add(sound1);

        planeAnimator = new AnimatedObject(plane);

        const animationLoader = new GLTFLoader();
        animationLoader.setPath('/assets/models/');

        const onLoad = (name, anim, global = false) =>
            planeAnimator.addAnimation(name, anim, global);

        animationLoader.load('toyPlane.glb', gltf => {
            onLoad('left', gltf.animations[1]);
            onLoad('right', gltf.animations[2]);
            onLoad('idle', gltf.animations[0], true);
            onLoad('propel', gltf.animations[3], true);
        });
        make_gui();
    });
}

function make_tpp(timeElapsed) {
    if (!plane) return;
    const offset = new THREE.Vector3(1, 10, -23);
    offset.applyQuaternion(plane.quaternion);
    offset.add(plane.position);

    const lookAt = new THREE.Vector3(0, 0, 10);
    lookAt.applyQuaternion(plane.quaternion);
    lookAt.add(plane.position);

    const t = 1.0 - Math.pow(0.001, timeElapsed);
    offset.lerp(offset, t);
    lookAt.lerp(lookAt, t);

    camera.position.copy(offset);
    camera.lookAt(lookAt);
}

function animate() {
    requestAnimationFrame(t => {
        if (!prevTime) prevTime = t;

        animate();

        if (gameOver) return;
        if (playerHealth == 0) {
            gameOver = true;
            document.getElementById('body').classList.add('over');
        }

        const timeElapsed = (t - prevTime) * 0.001;
        if (planeAnimator) planeAnimator.update(timeElapsed, keyboard.keys);

        update();
        make_tpp(timeElapsed);
        camera.position.y = Math.max(10, camera.position.y);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        prevTime = t;
    });
}

function move() {
    const controlObject = plane;

    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();
    const velocity = new THREE.Vector3(0.0, 0.0, 0.0);
    const speed = 10;
    let sideMovement = 0;
    if (keyboard.keys[KEY_FORWARD]) velocity.z += speed;
    if (keyboard.keys[KEY_BACKWARD]) velocity.z -= speed;

    if (keyboard.keys[KEY_TURN_LEFT]) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, Math.PI * 0.01);
        _R.multiply(_Q);
    }
    if (keyboard.keys[KEY_TURN_RIGHT]) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, -Math.PI * 0.01);
        _R.multiply(_Q);
    }
    if (keyboard.keys[KEY_LEFT]) {
        sideMovement = -1;
        velocity.z += speed;
    }
    if (keyboard.keys[KEY_RIGHT]) {
        sideMovement = 1;
        velocity.z += speed;
    }

    if (planeAnimator) {
        if (keyboard.keys[KEY_RIGHT]) planeAnimator.setState('right');
        else if (keyboard.keys[KEY_LEFT]) planeAnimator.setState('left');
    }

    if (!!(_R.w <= 0.8 && _R.w >= -0.8)) return;
    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    if (sideMovement) forward.cross(new THREE.Vector3(0, 1 * sideMovement, 0));
    forward.normalize();
    forward.multiplyScalar(velocity.z * 0.08);

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();
    sideways.multiplyScalar(velocity.x * 0.08);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);
    plane.position.copy(controlObject.position);

    if (keyboard.keys[KEY_SHOOT]) {
        if (plane) missileLauncher.add(plane.position, plane.quaternion);
        keyboard.keys[KEY_SHOOT] = false;
    }
}

function detectCollisions(objectMesh, colliderMesh) {
    const objBounds = new THREE.Box3().setFromObject(objectMesh);
    const colliderBounds = new THREE.Box3().setFromObject(colliderMesh);
    if (
        objBounds.min.x <= colliderBounds.max.x &&
        objBounds.min.y <= colliderBounds.max.y &&
        objBounds.min.z <= colliderBounds.max.z &&
        objBounds.max.x >= colliderBounds.min.x &&
        objBounds.max.y >= colliderBounds.min.y &&
        objBounds.max.z >= colliderBounds.min.z
    )
        return true;
    return false;
}

function checkPlaneObjCollisions(obj, isObs = true) {
    if (detectCollisions(plane, obj)) {
        if (isObs) {
            playerHealth = Math.max(0, playerHealth - 20);
            document.querySelector('.health').innerHTML = playerHealth.toString();
        }
        scene.remove(obj);
        return true;
    }
    return false;
}

function checkMissileObjCollisions(obj) {
    const to_remove = [];
    for (let i = 0; i < missileLauncher.missiles.length; i++) {
        const ms = missileLauncher.missiles[i];
        if (detectCollisions(ms.object, obj)) {
            scene.remove(ms.object);
            to_remove.push(ms);
            scene.remove(obj);
            scoreController.addStar(obj.position.clone());
        }
    }
    missileLauncher.remove(to_remove);
    return to_remove.length != 0;
}

function checkCollisions() {
    const to_remove_obstacles = [];
    for (let j = 0; j < obstacleController.obstacles.length; j++) {
        const obs = obstacleController.obstacles[j];
        if (checkMissileObjCollisions(obs)) to_remove_obstacles.push(obs);
        else if (checkPlaneObjCollisions(obs)) to_remove_obstacles.push(obs);
    }
    obstacleController.remove(to_remove_obstacles);

    const to_remove_planes = [];
    for (let j = 0; j < enemyController.obstacles.length; j++) {
        const enemy = enemyController.obstacles[j];
        if (checkMissileObjCollisions(enemy.object)) to_remove_planes.push(enemy);
        else if (checkPlaneObjCollisions(enemy.object)) to_remove_planes.push(enemy);
    }
    enemyController.remove(to_remove_planes);

    const to_remove_enemy_missiles = [];
    for (let j = 0; j < enemyController.missiles.length; j++) {
        const ms = enemyController.missiles[j];
        if (checkMissileObjCollisions(ms.object)) to_remove_enemy_missiles.push(ms);
        else if (checkPlaneObjCollisions(ms.object)) to_remove_enemy_missiles.push(ms);
    }
    enemyController.remove_missiles(to_remove_enemy_missiles);

    const to_remove_stars = [];
    for (let j = 0; j < scoreController.stars.length; j++) {
        const star = scoreController.stars[j];
        if (checkPlaneObjCollisions(star, false)) to_remove_stars.push(star);
    }
    scoreController.remove(to_remove_stars);
}

function update() {
    if (!plane) return;

    obstacleController.update(plane.position.clone());
    enemyController.update(plane.position.clone());
    missileLauncher.update(plane.position.clone());
    move();

    checkCollisions();
    const to_remove_stars = [];
    for (let i = 0; i < scoreController.stars.length; i++) {
        const star = scoreController.stars[i];
        if (detectCollisions(star, plane)) {
            scene.remove(star);
            to_remove_stars.push(star);
        }
    }
    scoreController.remove(to_remove_stars);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function make_gui() {
    const maxi = 200;
    var gui = new dat.GUI();

    var cam = gui.addFolder('Camera');
    cam.add(camera.position, 'x', -maxi, maxi).listen();
    cam.add(camera.position, 'y', -maxi, maxi).listen();
    cam.add(camera.position, 'z', -maxi, maxi).listen();
    cam.open();

    var planeGui = gui.addFolder('Plane');
    planeGui.add(plane.position, 'x', -10, 10).listen();
    planeGui.add(plane.position, 'y', -10, 10).listen();
    planeGui.add(plane.position, 'z', -10, 10).listen();
    planeGui.add(plane.quaternion, 'x', -2.0, 2.0).listen();
    planeGui.add(plane.quaternion, 'z', -2.0, 2.0).listen();
    planeGui.add(plane.quaternion, 'w', -2.0, 2.0).listen();
    planeGui.add(plane.quaternion, 'y', -1.0, 1.0).listen();
    planeGui.open();
}

init();
setLight();
loadGLTF();
animate();
window.addEventListener('resize', onWindowResize);
