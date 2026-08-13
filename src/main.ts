import { Clock, LoadingManager, PCFSoftShadowMap, WebGLRenderer } from 'three';
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

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
const scene = getScene();

const loadingManager = new LoadingManager();
loadingManager.onStart = (url, loaded, total) =>
    console.log(`Loading: ${url} (${loaded}/${total})`);
loadingManager.onProgress = (url, loaded, total) =>
    console.log(`Progress: ${url} (${loaded}/${total})`);
loadingManager.onLoad = () => console.log('All assets loaded.');
loadingManager.onError = (url) => console.error(`Failed to load: ${url}`);

addLights();
createIslands();
const grass = createGrass();
const sky = createSky();
const clampToFence = createFence();

const avatar = new Avatar();
const controls = new Controls(canvas);
const camera = new FollowCamera(canvas);
scene.add(camera.instance);

addHelpers();

// ===== 📈 STATS & CLOCK =====
const stats = new Stats();
document.body.appendChild(stats.dom);
const clock = new Clock();

function tick() {
    requestAnimationFrame(tick);

    stats.begin();

    const delta = clock.getDelta();
    avatar.update(delta, controls, clampToFence);
    camera.update(delta, avatar, renderer);
    sky.tick(delta);
    grass.tick(delta);

    renderer.render(scene, camera.instance);
    stats.end();
}

tick();
