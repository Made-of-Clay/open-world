import {
    BackSide,
    CanvasTexture,
    Color,
    Mesh,
    ShaderMaterial,
    SphereGeometry,
    Sprite,
    SpriteMaterial,
} from 'three';
import { getGui } from '../getGui';
import { getScene } from '../getScene';
import type { SkyTint } from '../time/dayCycle';

const CLOUD_SPREAD = 48;

interface CloudDef {
    x: number;
    z: number;
    y: number;
    scale: number;
    drift: number;
}

const CLOUD_DEFS: CloudDef[] = [
    { x: -20, z: -15, y: 32, scale: 14, drift: 1.4 },
    { x: 12, z: -30, y: 27, scale: 18, drift: 0.9 },
    { x: 36, z: 6, y: 34, scale: 12, drift: 1.8 },
    { x: -6, z: 26, y: 30, scale: 16, drift: 1.1 },
    { x: -30, z: 20, y: 25, scale: 10, drift: 1.6 },
    { x: 22, z: 28, y: 36, scale: 15, drift: 0.7 },
];

export interface Sky {
    tick(delta: number): void;
    setPalette(palette: SkyTint): void;
}

export function createSky(): Sky {
    const scene = getScene();
    const gui = getGui();
    const skyFolder = gui.addFolder('Sky');

    const skyMesh = new Mesh(
        new SphereGeometry(200, 32, 16),
        new ShaderMaterial({
            side: BackSide,
            depthWrite: false,
            uniforms: {
                topColor: { value: new Color('#2a7df0') },
                horizonColor: { value: new Color('#cfe9ff') },
                bottomColor: { value: new Color('#a8c6e0') },
            },
            vertexShader: `
                varying vec3 vWorldPos;
                void main() {
                    vec4 world = modelMatrix * vec4(position, 1.0);
                    vWorldPos = world.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 horizonColor;
                uniform vec3 bottomColor;
                varying vec3 vWorldPos;
                void main() {
                    float h = normalize(vWorldPos).y;
                    vec3 col = mix(horizonColor, topColor, smoothstep(0.12, 0.85, h));
                    col = mix(bottomColor, col, smoothstep(-0.25, 0.12, h));
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
        }),
    );
    skyMesh.frustumCulled = false;
    skyMesh.renderOrder = -1;
    scene.add(skyMesh);

    const cloudTexture = createCloudTexture();
    const clouds: Sprite[] = [];
    const cloudMaterials: SpriteMaterial[] = [];
    const cloudsFolder = skyFolder.addFolder('Clouds');
    CLOUD_DEFS.forEach((def, i) => {
        const material = new SpriteMaterial({
            map: cloudTexture,
            transparent: true,
            depthWrite: false,
            opacity: 0.95,
        });
        cloudMaterials.push(material);
        const sprite = new Sprite(material);
        sprite.position.set(def.x, def.y, def.z);
        sprite.scale.setScalar(def.scale);
        sprite.userData.drift = def.drift;
        clouds.push(sprite);
        scene.add(sprite);
        cloudsFolder.add(sprite, 'visible').name(`cloud ${i + 1}`);
    });

    return {
        tick(delta: number) {
            for (const cloud of clouds) {
                cloud.position.x += cloud.userData.drift * delta;
                if (cloud.position.x > CLOUD_SPREAD) cloud.position.x = -CLOUD_SPREAD;
            }
        },
        setPalette(palette: SkyTint) {
            const skyMaterial = skyMesh.material as ShaderMaterial;
            skyMaterial.uniforms.topColor.value.copy(palette.top);
            skyMaterial.uniforms.horizonColor.value.copy(palette.horizon);
            skyMaterial.uniforms.bottomColor.value.copy(palette.bottom);
            for (const material of cloudMaterials) material.color.copy(palette.cloud);
        },
    };
}

function createCloudTexture(): CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d canvas context unavailable');

    const blobs = [
        { x: 0.5, y: 0.55, r: 0.28 },
        { x: 0.3, y: 0.5, r: 0.18 },
        { x: 0.7, y: 0.52, r: 0.16 },
        { x: 0.5, y: 0.72, r: 0.2 },
    ];
    for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
            blob.x * size,
            blob.y * size,
            blob.r * size * 0.2,
            blob.x * size,
            blob.y * size,
            blob.r * size,
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
    }

    return new CanvasTexture(canvas);
}
