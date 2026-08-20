import { PCFSoftShadowMap, Timer, WebGLRenderer } from 'three';
import Stats from 'stats.js';
import './style.css';
import { addLights } from './addLights';
import { addHelpers } from './addHelpers';
import { getScene } from './getScene';
import { Avatar } from './avatar/avatar';
import { Controls } from './avatar/controls';
import { FollowCamera } from './avatar/FollowCamera';
import { createFence } from './world/fence';
import { createGrass } from './world/grass';
import { createIslands } from './world/islands';
import { createSky } from './world/sky';
import { getGui } from './getGui';
import { DayCycle } from './time/dayCycle';
import { createTimeGui } from './time/timeGui';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getLoadingManager } from './getLoadingManager';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
const scene = getScene();

const loadingManager = getLoadingManager();

const cheese: Promise<GLTF> = new Promise((resolve, reject) => {
    const loader = new GLTFLoader(loadingManager);
    loader.load('/models/cheese.glb', resolve, undefined, reject);
});
cheese.then((gltf) => scene.add(gltf.scene)).catch(console.error);

const lights = addLights();
createIslands();
const grass = createGrass();
const sky = createSky();
const clampToFence = createFence();

const dayCycle = new DayCycle();
const timeGui = createTimeGui(dayCycle);

const avatar = new Avatar();
const controls = new Controls(canvas);
const camera = new FollowCamera(canvas);
scene.add(camera.instance);

addHelpers();

const gui = getGui();
gui.close();

// ===== 📈 STATS & CLOCK =====
const stats = new Stats();
document.body.appendChild(stats.dom);
const timer = new Timer();
timer.connect(document);

let guiRefreshTimer = 0;

function tick(timestamp: number) {
    requestAnimationFrame(tick);

    stats.begin();

    timer.update(timestamp);
    const delta = timer.getDelta();
    dayCycle.tick(delta);
    const dayState = dayCycle.state;
    sky.setPalette(dayState);
    lights.setLighting(dayState);

    avatar.update(delta, controls, clampToFence);
    camera.update(delta, avatar, renderer);
    sky.tick(delta);
    grass.tick(delta);

    guiRefreshTimer += delta;
    if (guiRefreshTimer >= 0.5) {
        guiRefreshTimer = 0;
        timeGui.refresh();
    }

    renderer.render(scene, camera.instance);
    stats.end();
}

tick(performance.now());
