import { AnimationMixer } from 'three';

export class FiniteStateMachine {
    constructor(object) {
        this.states = {}; // state(name) : {Parent, animations{clips, action}}
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
        console.log(name, this.states, state);

        this.curState = state;
        this.curState.Enter(prevState);
    }

    update(timeElapsed) {
        this.mixer.update(timeElapsed);
        if (this.curState) {
            this.curState.Update(timeElapsed);
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
        // for (let i = 0; i < this.animations.length; i++) {
        curAction.play();
        // }
    }
    Update() {}
}

// export class IdleState extends State {
//     constructor(parent) {
//         super(parent);
//     }

//     get Name() {
//         return 'idle';
//     }

//     Enter(prevState) {
//         const idleAction = this.parent._animations['idle'].action;
//         console.log(this.parent);
//         console.log(this.parent.proxy, this.parent.proxy._animations);
//         console.log(idleAction);
//         if (prevState) {
//             const prevAction = this.parent.proxy._animations[prevState.Name].action;
//             idleAction.time = 0.0;
//             idleAction.enabled = true;
//             idleAction.setEffectiveTimeScale(1.0);
//             idleAction.setEffectiveWeight(1.0);
//             idleAction.crossFadeFrom(prevAction, 0.5, true);
//             idleAction.play();
//         } else {
//             // console.log('Action', action);
//             idleAction.play();
//             console.log(idleAction.play);
//         }
//     }

//     Exit() {}

//     Update(keys) {
//         // Change state here
//         if (keys || input._keys.backward) {
//             this.parent.setState('walk');
//         } else if (input._keys.space) {
//             this.parent.setState('dance');
//         }
//     }
// }
