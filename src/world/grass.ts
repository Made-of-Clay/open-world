import {
    DoubleSide,
    Euler,
    InstancedMesh,
    Matrix4,
    PlaneGeometry,
    Quaternion,
    ShaderMaterial,
    Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getIslands } from './islands';

const BLADE_WIDTH = 0.06;
const BLADE_HEIGHT = 0.7;
const DENSITY = 16;

export interface Grass {
    tick(delta: number): void;
}

export function createGrass(): Grass {
    const blade = mergeGeometries([
        new PlaneGeometry(BLADE_WIDTH, BLADE_HEIGHT, 1, 4),
        new PlaneGeometry(BLADE_WIDTH, BLADE_HEIGHT, 1, 4).rotateY(Math.PI / 2),
    ]);
    const material = new ShaderMaterial({
        side: DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
            uniform float uTime;
            varying float vBladeHeight;
            void main() {
                vec3 world = (instanceMatrix * vec4(position, 1.0)).xyz;
                float h = position.y / ${BLADE_HEIGHT};
                float sway = sin(uTime * 2.2 + world.x * 0.8 + world.z * 0.6);
                float swayZ = cos(uTime * 1.7 + world.z * 0.9 + world.x * 0.4);
                world.x += sway * h * 0.3;
                world.z += swayZ * h * 0.24;
                gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
                vBladeHeight = h;
            }
        `,
        fragmentShader: `
            varying float vBladeHeight;
            void main() {
                vec3 baseColor = vec3(0.13, 0.35, 0.10);
                vec3 tipColor = vec3(0.42, 0.72, 0.26);
                gl_FragColor = vec4(mix(baseColor, tipColor, smoothstep(0.0, 1.0, vBladeHeight)), 1.0);
            }
        `,
    });

    getIslands().forEach((island, index) => {
        const count = Math.floor(island.radius ** 2 * DENSITY);
        const mesh = new InstancedMesh(blade, material, count);
        const rand = mulberry32(index + 1);
        const matrix = new Matrix4();
        const quaternion = new Quaternion();
        const position = new Vector3();
        const scale = new Vector3();
        const yaw = new Euler();
        for (let i = 0; i < count; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = Math.sqrt(rand()) * island.radius * 0.9;
            position.set(
                island.x + Math.cos(angle) * dist,
                island.topY + 0.02,
                island.z + Math.sin(angle) * dist,
            );
            yaw.y = rand() * Math.PI;
            quaternion.setFromEuler(yaw);
            scale.set(0.8 + rand() * 0.4, 0.9 + rand() * 0.6, 0.8 + rand() * 0.4);
            matrix.compose(position, quaternion, scale);
            mesh.setMatrixAt(i, matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        island.group.add(mesh);
    });

    return {
        tick(delta: number) {
            material.uniforms.uTime.value += delta;
        },
    };
}

function mulberry32(seed: number): () => number {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
