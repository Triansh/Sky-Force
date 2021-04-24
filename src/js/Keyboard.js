class Keyboard {
    constructor() {
        this.keys = new Array(256).fill(false);
        window.addEventListener('keydown', e => this.onDocumentKeyDown(e), false);
        window.addEventListener('keyup', e => this.onDocumentKeyUp(e), false);
    }

    onDocumentKeyDown(event) {
        const keyCode = event.which;
        this.keys[keyCode] = true;
    }

    onDocumentKeyUp(event) {
        const keyCode = event.which;
        this.keys[keyCode] = false;
    }
}

export default Keyboard;
