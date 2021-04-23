import { AnimationMixer } from 'three';
import { KEY_RIGHT, KEY_LEFT } from './keys';

export class FiniteStateMachine {
    constructor(object) {
        this.states = {}; // state(name) : {State}
        this.curState = null;
        this.mixer = new AnimationMixer(object);
    }

    addState(name, state) {
        this.states[name] = state;
    }

    setState(name) {
        const prevState = this.curState;
        if (prevState && prevState.name == name) {
            return;
        }

        const state = this.states[name];
        this.curState = state;
        this.curState.Enter(prevState);
    }

    update(timeElapsed, keys) {
        this.mixer.update(timeElapsed);
        if (this.curState) {
            this.curState.Update();
            if (
                (this.curState.name == 'right' && !keys[KEY_RIGHT]) ||
                (this.curState.name == 'left' && !keys[KEY_LEFT])
            ) {
                this.curState.animations.action.fadeOut(0.8);
                this.curState = this.states['idle'];
            }
        }
    }
}

export class AnimatedObject extends FiniteStateMachine {
    constructor(object) {
        super(object);
    }

    addAnimation(animName, clip, global) {
        const action = this.mixer.clipAction(clip);
        const state = new State(
            animName,
            {
                action,
                clip,
            },
            global
        );
        this.addState(animName, state);
        this.setState(animName);
    }
}

export class State {
    constructor(name, animations, global) {
        this.name = name;
        this.animations = animations;
        this.global = global;
    }

    Enter(prevState) {
        const curAction = this.animations.action;
        if (prevState) {
            const prevAction = prevState.animations.action;
            curAction.time = 0.0;
            curAction.enabled = true;
            curAction.setEffectiveTimeScale(1.0);
            curAction.setEffectiveWeight(1.0);
            if (!prevState.global) curAction.crossFadeFrom(prevAction, 0.5, true);
        }
        console.log(this.name);
        curAction.play();
    }
    Update() {}
}
