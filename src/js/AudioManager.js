import * as THREE from 'three';

class AudioManager {
    constructor(camera) {
        this.audioLoader = new THREE.AudioLoader();
        this.audioLoader.setPath('/assets/audio/');
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.states = {};
    }

    addPositionalAudio(name, path, object, loop = false, volume = 0.2, distance = 15) {
        if (this.states[name]) {
            if (object) object.add(this.states[name]);
            return;
        }
        const sound = new THREE.PositionalAudio(this.listener);
        this.audioLoader.load(path, buffer => {
            sound.setBuffer(buffer);
            sound.setRefDistance(distance);
            sound.setLoop(loop);
            sound.setVolume(volume);
            if (loop) sound.play();
        });
        if (object) object.add(sound);
        this.states[name] = sound;
    }

    playSound(name) {
        if (this.states[name]) this.states[name].play();
    }

    addGlobalAudio(name, path, volume = 0.25) {
        if (this.states[name]) return;

        const sound = new THREE.Audio(this.listener);
        this.audioLoader.load(path, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(volume);
            sound.play();
        });
        this.states[name] = sound;
    }

    getSound(name) {
        return this.states[name];
    }
}

export default AudioManager;
