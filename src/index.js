import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import Floor from './js/Floor';
import Keyboard from './js/Keyboard';
import MissileLauncher from './js/MissileLauncher';
import { FSM, AnimatedObject } from './js/FSM';

import { makeLines } from './js/makeLines';

// import skyImage from '/assets/images/sky.jpg';
// import skyImage2 from '/assets/images/sky2.jpg';
import ObstacleController from './js/ObstacleController';
import ScoreController from './js/ScoreController';
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
const missileLauncher = new MissileLauncher();
const obstacleController = new ObstacleController();
const scoreController = new ScoreController();

let plane;
let prevTime = null;
let planeMixer;
const animations = {};
let planeAnimator;

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
    const cubetexture = new THREE.TextureLoader().setPath('/assets/images/poly/').load(
        // [
        '1.png',
        // '2.png',
        // '3.jpg',
        // '4.png',
        // '5.jpg',
        // '4.png',
        //'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'], () => {
        // ],
        () => {
            cubetexture.encoding = THREE.sRGBEncoding;
            scene.background = cubetexture;
            renderer.render(scene, camera);
        }
    );
    scene.background = cubetexture;
    scene.fog = new THREE.FogExp2('#ccff', 0.004);
    camera.add(listener);
    camera.position.set(14, 22, -18);
    camera.lookAt(9, YPos, 10);
    const floor = new Floor(10000, '#336633');
    scene.add(floor.mesh);
    setupControls();
    obstacleController.add(scene, new THREE.Vector3(0, 8, -75));
}

function setLight() {
    let l = new THREE.AmbientLight(0xffffff, 2);
    scene.add(l);
    // const light = new THREE.PointLight(0xffffff, 1); // soft white light
    // light.position.set(100, 100, 100).normalize();
    // light.lookAt(0, 0, 0);
    // scene.add(light);
}

function setupControls() {
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxDistance = 1000; // Set our max zoom out distance (mouse scroll)
    controls.minDistance = 10; // Set our min zoom in distance (mouse scroll)
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

function make_tpp() {
    if (!plane) return;
    const offset = new THREE.Vector3(1, 10, -23);
    offset.applyQuaternion(plane.quaternion);
    offset.add(plane.position);

    const lookAt = new THREE.Vector3(0, 0, 10);
    lookAt.applyQuaternion(plane.quaternion);
    lookAt.add(plane.position);

    camera.position.copy(offset);
    camera.lookAt(lookAt);
}

function animate() {
    requestAnimationFrame(t => {
        if (!prevTime) prevTime = t;

        animate();
        if (planeAnimator) planeAnimator.update((t - prevTime) * 0.001, keyboard.keys);

        update();
        make_tpp();
        camera.position.y = Math.max(10, camera.position.y);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        prevTime = t;
    });
}

function move() {
    if (!plane) return;
    const controlObject = plane;

    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();
    const velocity = new THREE.Vector3(0.0, 0.0, 0.0);
    const speed = 10;
    let sideMovement = 0;
    if (keyboard.keys[KEY_FORWARD]) {
        velocity.z += speed;
    }
    if (keyboard.keys[KEY_BACKWARD]) {
        velocity.z -= speed;
    }
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
        if (keyboard.keys[KEY_RIGHT]) {
            planeAnimator.setState('right');
        } else if (keyboard.keys[KEY_LEFT]) {
            planeAnimator.setState('left');
        }
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    if (sideMovement) forward.cross(new THREE.Vector3(0, 1 * sideMovement, 0));
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * 0.08);
    forward.multiplyScalar(velocity.z * 0.08);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    if (keyboard.keys[KEY_SHOOT]) {
        if (plane) missileLauncher.add(scene, plane.position, plane.quaternion);
        keyboard.keys[KEY_SHOOT] = false;
    }
    // console.log(plane.quaternion)

    plane.position.copy(controlObject.position);
    // camera.lookAt(plane.position);
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
    planeGui.add(plane.scale, 'x', -10, 10).listen();
    planeGui.add(plane.scale, 'y', -10, 10).listen();
    planeGui.add(plane.scale, 'z', -10, 10).listen();
    planeGui.open();
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

function update() {
    // stateMachine.Update(0.0005, null);
    if (plane) obstacleController.update(plane.position.clone());
    move();
    missileLauncher.move();
    const to_remove_missiles = [];
    const to_remove_obstacles = [];
    for (let i = 0; i < missileLauncher.missiles.length; i++) {
        const missile = missileLauncher.missiles[i];
        let collided = false;
        for (let j = 0; j < obstacleController.obstacles.length; j++) {
            const obs = obstacleController.obstacles[j];
            if (detectCollisions(missile.object, obs)) {
                scoreController.addStar(scene, obs.position.clone());
                scene.remove(missile.object);
                scene.remove(obs);
                to_remove_missiles.push(missile);
                to_remove_obstacles.push(obs);
                collided = true;
                break;
            }
        }
        if (!collided) missile.object.position.add(missile.forward);
    }
    missileLauncher.remove(to_remove_missiles);
    obstacleController.remove(to_remove_obstacles);

    if (plane) {
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
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
setLight();
loadGLTF();
animate();
window.addEventListener('resize', onWindowResize);
