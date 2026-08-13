import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
import { getGui } from '../getGui';
import { getScene } from '../getScene';

export const FENCE_RADIUS = 14;
const FLOOR_Y = 0;

export function createFence(): (position: Vector3) => void {
    const scene = getScene();
    const gui = getGui();
    const fenceFolder = gui.addFolder('World').addFolder('Fence');

    const boundary = new Mesh(
        new SphereGeometry(FENCE_RADIUS, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new MeshBasicMaterial({
            color: '#ff4d6d',
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        }),
    );
    boundary.visible = false;
    scene.add(boundary);
    fenceFolder.add(boundary, 'visible').name('Show boundary');

    return (position: Vector3) => {
        if (position.y < FLOOR_Y) position.y = FLOOR_Y;

        const horizontalSq = position.x ** 2 + position.z ** 2;
        if (horizontalSq > FENCE_RADIUS ** 2) {
            const scale = FENCE_RADIUS / Math.sqrt(horizontalSq);
            position.x *= scale;
            position.z *= scale;
        }

        const maxY = Math.sqrt(Math.max(0, FENCE_RADIUS ** 2 - position.x ** 2 - position.z ** 2));
        if (position.y > maxY) position.y = maxY;
    };
}
