import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import Floor from './js/Floor';
import Keyboard from './js/Keyboard';
import MissileLauncher from './js/Missile';

import { makeLines } from './js/makeLines';

import skyImage from '/assets/images/sky.jpg';
import skyImage2 from '/assets/images/sky2.jpg';
import ObstacleController from './js/ObstacleController';
import ScoreController from './js/ScoreController';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);
const keyboard = new Keyboard();
const missileLauncher = new MissileLauncher();
const obstacleController = new ObstacleController();
const scoreController = new ScoreController();

let plane;

const YPos = 8;

function init() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
        skyImage2,
        
        // '/assets/images/sky.jpg',
        // '/assets/images/sky.jpg',
        // '/assets/images/sky.jpg',
        // '/assets/images/sky.jpg',
        // '/assets/images/sky.jpg',
        // '/assets/images/sky.jpg',
    );
    texture.encoding = THREE.sRGBEncoding;
    scene.background = texture;
    scene.fog = new THREE.FogExp2('#ccff', 0.004);
    camera.position.set(-30, 10, -10);
    camera.lookAt(0, 0, 0);
    const floor = new Floor(10000, '#336633');
    scene.add(floor.mesh);
    window.addEventListener('resize', onWindowResize);
    setupControls();
}

function setLight() {
    let l = new THREE.AmbientLight(0xffffff, 2);
    scene.add(l);
    const light = new THREE.PointLight(0xffffff, 1); // soft white light
    light.position.set(100, 100, 100).normalize();
    light.lookAt(0, 0, 0);
    scene.add(light);
}

function setupControls() {
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxDistance = 1000; // Set our max zoom out distance (mouse scroll)
    controls.minDistance = 60; // Set our min zoom in distance (mouse scroll)
    controls.target.copy(new THREE.Vector3(0, 0, 0));
}

function loadGLTF() {
    let planeLoader = new GLTFLoader();

    planeLoader.load('/assets/models/toyPlane.glb', gltf => {
        plane = gltf.scene;
        plane.scale.set(0.2, 0.2, 0.2);
        scene.add(plane);
        plane.position.x = 0;
        plane.position.y = YPos;
        plane.position.z = 0;
        makeLines(scene, plane.position);
        plane.scale.multiplyScalar(10)
        obstacleController.add(scene, plane.position.clone());
        console.log(plane);
        make_gui();
    });
}

function make_tpp() {
    if (!plane) return;
    const offset = new THREE.Vector3(-6, YPos - 2, -15);
    offset.applyQuaternion(plane.quaternion);
    offset.add(plane.position);

    const lookAt = new THREE.Vector3(0, 3, 10);
    lookAt.applyQuaternion(plane.quaternion);
    lookAt.add(plane.position);

    camera.position.copy(offset);
    camera.lookAt(lookAt);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    // make_tpp();
    camera.position.y = Math.max(10, camera.position.y);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
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
    // let planeGui = 0;
    if (keyboard.keys[38]) {
        // velocity += speed;
        velocity.z += speed;
        // camera.position.x += velocity.z;
    }
    if (keyboard.keys[40]) {
        // velocity -= speed;
        velocity.z -= speed;
        // camera.position.x -= velocity.z;
    }
    if (keyboard.keys[65]) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * 0.001);
        _R.multiply(_Q);
    }
    if (keyboard.keys[68]) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, -4.0 * Math.PI * 0.001);
        _R.multiply(_Q);
    }
    if (keyboard.keys[37]) {
        sideMovement = -1;
        velocity.z += speed;
    }
    if (keyboard.keys[39]) {
        sideMovement = 1;
        velocity.z += speed;
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

    sideways.multiplyScalar(velocity.x * 0.05);
    forward.multiplyScalar(velocity.z * 0.05);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    if (keyboard.keys[32]) {
        if (plane) missileLauncher.add(scene, plane.position, plane.quaternion);
        keyboard.keys[32] = false;
    }

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
    renderer.render(scene, camera);
}

init();
setLight();
loadGLTF();
animate();
