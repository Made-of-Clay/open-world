import { AmbientLight, DirectionalLight, HemisphereLight } from 'three';
import type { LightingState } from './time/dayCycle';
import { getGui } from './getGui';
import { getScene } from './getScene';

export interface Lights {
    setLighting(state: LightingState): void;
}

export function addLights(): Lights {
    const gui = getGui();
    const lightsFolder = gui.addFolder('Lights');

    const ambientLight = new AmbientLight('#ffffff', 0.35);
    lightsFolder.add(ambientLight, 'visible').name('Ambient');

    const hemisphereLight = new HemisphereLight('#bfd9ff', '#6fbf4a', 0.5);
    lightsFolder.add(hemisphereLight, 'visible').name('Hemisphere');

    const sunLight = new DirectionalLight('#fff4e0', 2.4);
    sunLight.position.set(12, 24, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    sunLight.shadow.bias = -0.0005;
    lightsFolder.add(sunLight, 'visible').name('Sun');

    const scene = getScene();
    scene.add(ambientLight, hemisphereLight, sunLight);

    return {
        setLighting(state: LightingState) {
            ambientLight.intensity = state.ambientIntensity;
            hemisphereLight.intensity = state.hemisphereIntensity;
            sunLight.intensity = state.sunIntensity;
            sunLight.color.copy(state.sunColor);
        },
    };
}
