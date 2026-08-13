import { Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';
import { getGui } from '../getGui';
import { getScene } from '../getScene';
import { heightAt } from '../world/islands';
import type { Controls } from './controls';

const RADIUS = 0.45;
const MOVE_SPEED = 6;
const GRAVITY = 24;
const LOOK_SPEED = 0.0022;
const PITCH_MIN = -0.5;
const PITCH_MAX = 1.1;
const SPAWN = new Vector3(0, 0, 9);

export class Avatar {
    mesh: Mesh;
    position: Vector3;
    yaw = 0;
    pitch = 0.3;
    #velocity = new Vector3();

    constructor() {
        this.mesh = new Mesh(
            new SphereGeometry(RADIUS, 24, 16),
            new MeshStandardMaterial({
                color: '#ff8c42',
                roughness: 0.4,
                metalness: 0.1,
            }),
        );
        this.mesh.castShadow = true;
        this.position = this.mesh.position;
        this.position.copy(SPAWN);
        this.position.y = heightAt(this.position.x, this.position.z) + RADIUS;
        getScene().add(this.mesh);

        const avatarFolder = getGui().addFolder('Avatar');
        avatarFolder.add(this.mesh, 'visible').name('Avatar');
    }

    update(delta: number, controls: Controls, clampFence: (position: Vector3) => void) {
        this.yaw -= controls.lookX * LOOK_SPEED;
        this.pitch -= controls.lookY * LOOK_SPEED;
        this.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, this.pitch));
        controls.lookX = 0;
        controls.lookY = 0;

        const forward = new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        const right = new Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
        const move = new Vector3();
        if (controls.locked && controls.keys.forward) move.add(forward);
        if (controls.locked && controls.keys.back) move.sub(forward);
        if (controls.locked && controls.keys.strafeRight) move.add(right);
        if (controls.locked && controls.keys.strafeLeft) move.sub(right);

        if (move.lengthSq() > 0) move.normalize().multiplyScalar(MOVE_SPEED);
        this.#velocity.x = move.x;
        this.#velocity.z = move.z;
        this.#velocity.y -= GRAVITY * delta;
        this.position.addScaledVector(this.#velocity, delta);

        const minY = heightAt(this.position.x, this.position.z) + RADIUS;
        if (this.position.y < minY) {
            this.position.y = minY;
            this.#velocity.y = 0;
        }

        clampFence(this.position);
    }
}
