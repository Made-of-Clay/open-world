import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import { getGui } from '../getGui';
import { getScene } from '../getScene';

export interface IslandDef {
    id: string;
    x: number;
    z: number;
    radius: number;
    topY: number;
    grassColor: string;
    earthColor: string;
}

const GRASS_HEIGHT = 0.3;
const EARTH_FLATNESS = 0.6;

export const ISLAND_DEFS: IslandDef[] = [
    {
        id: 'meadow',
        x: 0,
        z: 9,
        radius: 5.5,
        topY: 1.8,
        grassColor: '#7ecb57',
        earthColor: '#8a5a34',
    },
    {
        id: 'grove',
        x: 8,
        z: -4,
        radius: 2.5,
        topY: 1.2,
        grassColor: '#8fd465',
        earthColor: '#7d4f2c',
    },
    {
        id: 'moor',
        x: -7,
        z: -7,
        radius: 4.2,
        topY: 2.1,
        grassColor: '#6dbd4a',
        earthColor: '#6e4a2a',
    },
    {
        id: 'knoll',
        x: -14,
        z: 5,
        radius: 2.2,
        topY: 1.0,
        grassColor: '#9cdb6e',
        earthColor: '#8a5a34',
    },
];

export interface Island extends IslandDef {
    group: Group;
}

let islands: Island[];

export function getIslands(): Island[] {
    return islands;
}

export function createIslands(): Island[] {
    const scene = getScene();
    const gui = getGui();
    const islandsFolder = gui.addFolder('World').addFolder('Islands');

    islands = ISLAND_DEFS.map((def) => {
        const group = new Group();
        group.position.set(def.x, 0, def.z);

        const grass = new Mesh(
            new CylinderGeometry(def.radius, def.radius, GRASS_HEIGHT, 32),
            new MeshStandardMaterial({
                color: def.grassColor,
                roughness: 0.95,
            }),
        );
        grass.position.y = def.topY - GRASS_HEIGHT / 2;
        grass.castShadow = true;
        grass.receiveShadow = true;

        const earth = new Mesh(
            new SphereGeometry(def.radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            new MeshStandardMaterial({
                color: def.earthColor,
                roughness: 1,
            }),
        );
        earth.scale.y = EARTH_FLATNESS;
        earth.position.y = def.topY - GRASS_HEIGHT;
        earth.castShadow = true;
        earth.receiveShadow = true;

        group.add(grass, earth);
        group.name = def.id;
        scene.add(group);
        islandsFolder.add(group, 'visible').name(def.id);
        return { ...def, group };
    });

    return islands;
}

export function heightAt(x: number, z: number): number {
    if (!islands) return 0;
    let maxY = 0;
    for (const island of islands) {
        const d = Math.hypot(x - island.x, z - island.z);
        if (d < island.radius) maxY = Math.max(maxY, island.topY);
    }
    return maxY;
}
