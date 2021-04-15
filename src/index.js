import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import Floor from './js/Floor';
import Keyboard from './js/Keyboard';

import { makeLines } from './js/makeLines';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1000);
const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);
const keyboard = new Keyboard();

let plane;
let missiles = [];
let obstacles = [];
let colliders = [];

function init() {
    scene.background = new THREE.Color('black');
    scene.fog = new THREE.FogExp2('#ccff', 0.003);
    camera.position.set(300, 100, 0);
    camera.lookAt(0, 0, 0);
    const floor = new Floor(10000, '#336633');
    scene.add(floor.mesh);
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
    let balloonLoader = new GLTFLoader();

    balloonLoader.load('/models/plane.glb', gltf => {
        plane = gltf.scene;
        plane.scale.set(0.2, 0.2, 0.2);
        scene.add(plane);
        plane.position.x = 0;
        plane.position.y = 0;
        plane.position.z = 0;
        makeLines(scene, plane.position);
        make_gui();
    });
}

function animate() {
    requestAnimationFrame(animate);
    // if (plane && plane.rotation) {
    //     // plane.rotation.y -= 0.005;
    // }
    // console.log(Mesh.position);
    camera.position.y = Math.max(10, camera.position.y);
    move();
    moveMissiles();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
}

function move() {
    if (!plane) return;
    const controlObject = plane;
    // let planeGui = 0;
    if (keyboard.keys[38]) {
        // velocity += speed;
        controlObject.position.x += 1;
        camera.position.x += 1;
    }
    if (keyboard.keys[40]) {
        // velocity -= speed;
        controlObject.position.x -= 1;
        camera.position.x -= 1;
    }
    if (keyboard.keys[37]) {
        controlObject.position.z -= 1;
        camera.position.z -= 1;
    }
    if (keyboard.keys[39]) {
        controlObject.position.z += 1;
        camera.position.z += 1;
    }

    if (keyboard.keys[65]) {
        create_missiles();
        keyboard.keys[65] = false;
    }
    plane.position.copy(controlObject.position);
    camera.lookAt(plane.position);
}

function moveMissiles() {
    const to_remove = [];
    for (let i = 0; i < missiles.length; i++) {
        if (detectCollisions(missiles[i])) {
            scene.remove(missiles[i]);
            to_remove.push(missiles[i]);
        } else {
            missiles[i].position.x -= 1.5;
        }
    }

    missiles = missiles.filter(m => !to_remove.includes(m));
}

const maxi = 200;

function make_gui() {
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

function createObs() {
    const characterSize = 5;
    var geometry = new THREE.BoxGeometry(characterSize, characterSize, characterSize);
    var material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const ob = new THREE.Mesh(geometry, material);
    ob.position.set(
        Math.round(Math.random() * 100),
        characterSize / 2,
        Math.round(Math.random() * 100)
    );
    scene.add(ob);
    obstacles = [...obstacles, ob];
    calculateCollisionPoints(ob);
}

function create_missiles() {
    if (plane) {
        const size = 3;
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const ob = new THREE.Mesh(geometry, material);
        ob.position.x = plane.position.x;
        ob.position.y = plane.position.y;
        ob.position.z = plane.position.z + 2;
        const ob2 = ob.clone();
        ob2.position.z -= 2 * 2;
        scene.add(ob);
        scene.add(ob2);
        missiles = [...missiles, ob, ob2];
    }
}

function calculateCollisionPoints(mesh) {
    var bbox = new THREE.Box3().setFromObject(mesh);
    var bounds = {
        xMin: bbox.min.x,
        xMax: bbox.max.x,
        yMin: bbox.min.y,
        yMax: bbox.max.y,
        zMin: bbox.min.z,
        zMax: bbox.max.z,
    };
    colliders.push(bounds);
}

function detectCollisions(mesh) {
    // Get the user's current collision area.
    var bounds = {
        xMax: mesh.position.x - mesh.geometry.parameters.width / 2,
        xMin: mesh.position.x + mesh.geometry.parameters.width / 2,
        yMin: mesh.position.y - mesh.geometry.parameters.height / 2,
        yMax: mesh.position.y + mesh.geometry.parameters.height / 2,
        zMin: mesh.position.z - mesh.geometry.parameters.width / 2,
        zMax: mesh.position.z + mesh.geometry.parameters.width / 2,
    };

    // Run through each object and detect if there is a collision.
    for (var index = 0; index < colliders.length; index++) {
        if (
            bounds.xMin <= colliders[index].xMax &&
            bounds.xMax >= colliders[index].xMin &&
            bounds.yMin <= colliders[index].yMax &&
            bounds.yMax >= colliders[index].yMin &&
            bounds.zMin <= colliders[index].zMax &&
            bounds.zMax >= colliders[index].zMin
        ) {
            return true;
        }
    }
    return false;
}

init();
setLight();
loadGLTF();
animate();
createObs();
createObs();
createObs();
createObs();
createObs();
