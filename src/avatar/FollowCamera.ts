import { PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { resizeRendererToDisplaySize } from '../helpers/responsiveness';
import type { Avatar } from './avatar';

const DISTANCE = 3.2;
const EYE_HEIGHT = 0.6;

export class FollowCamera {
    instance: PerspectiveCamera;
    #canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.#canvas = canvas;
        this.instance = new PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000,
        );
    }

    update(delta: number, avatar: Avatar, renderer: WebGLRenderer) {
        if (resizeRendererToDisplaySize(renderer)) {
            this.instance.aspect = this.#canvas.clientWidth / this.#canvas.clientHeight;
            this.instance.updateProjectionMatrix();
        }

        const offset = new Vector3(
            DISTANCE * Math.sin(avatar.yaw) * Math.cos(avatar.pitch),
            DISTANCE * Math.sin(avatar.pitch) + EYE_HEIGHT,
            DISTANCE * Math.cos(avatar.yaw) * Math.cos(avatar.pitch),
        );
        const desired = avatar.position.clone().add(offset);
        this.instance.position.lerp(desired, 1 - Math.pow(0.001, delta));
        this.instance.lookAt(avatar.position.x, avatar.position.y + EYE_HEIGHT, avatar.position.z);
    }
}
