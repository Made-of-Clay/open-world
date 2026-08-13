export interface MovementKeys {
    forward: boolean;
    back: boolean;
    strafeLeft: boolean;
    strafeRight: boolean;
}

const KEY_BINDINGS: Record<string, keyof MovementKeys> = {
    KeyW: 'forward',
    ArrowUp: 'forward',
    KeyS: 'back',
    ArrowDown: 'back',
    KeyA: 'strafeLeft',
    ArrowLeft: 'strafeLeft',
    KeyD: 'strafeRight',
    ArrowRight: 'strafeRight',
};

export class Controls {
    keys: MovementKeys = {
        forward: false,
        back: false,
        strafeLeft: false,
        strafeRight: false,
    };
    lookX = 0;
    lookY = 0;
    #canvas: HTMLCanvasElement;
    #locked = false;

    constructor(canvas: HTMLCanvasElement) {
        this.#canvas = canvas;
        canvas.addEventListener('click', () => canvas.requestPointerLock());
        document.addEventListener('pointerlockchange', () => {
            this.#locked = document.pointerLockElement === this.#canvas;
            if (!this.#locked) {
                this.lookX = 0;
                this.lookY = 0;
            }
        });
        document.addEventListener('mousemove', (event) => {
            if (!this.#locked) return;
            this.lookX += event.movementX;
            this.lookY += event.movementY;
        });
        document.addEventListener('keydown', (event) => this.#setKey(event.code, true));
        document.addEventListener('keyup', (event) => this.#setKey(event.code, false));
    }

    get locked() {
        return this.#locked;
    }

    #setKey(code: string, pressed: boolean) {
        const binding = KEY_BINDINGS[code];
        if (binding) this.keys[binding] = pressed;
    }
}
