# Open World — Implementation Plan

Agent-agnostic implementation plan derived from `README.md`. Terse. Follow phases in order. Commit at end of each phase.

## Stack

- Three.js + TypeScript + Vite (pnpm).
- Existing infra: `getScene`, `getGui` (lil-gui), `ProjectCamera` (OrbitControls), `addLights`, `addHelpers`, Stats, LoadManager seed in `main.ts`.
- Commands: `pnpm dev` | `pnpm build` | `pnpm lint` | `pnpm fmt`.

## Phase 1 — World + Avatar

Open world, very simple avatar (sphere). Floating islands (half spheres). Pleasant background sky + stylized clouds. Daylight. Collision + invisible "fence" boundary. Swaying grass blades. LoadingManager progress logging.

1. **Islands**
    - Hand-placed fixed positions (deterministic, stable for later phases).
    - Flat-top grass cap (cylinder) + brown earth bottom (flattened bottom half-sphere `SphereGeometry`), 3-4 islands scattered, different radii/heights. Ground/none at origin.
    - Collision per island: flat height = `topY` within island radius.
2. **Sky + clouds + daylight**
    - Gradient sky (daylight), bright but stylized.
    - Stylized clouds: billboard sprites or additive blobs at height, slow drift.
    - Ambient + hemisphere + directional sun light, shadows.
3. **Avatar + controls**
    - Sphere mesh = avatar (simple material).
    - Pointer-lock FPS: click canvas to lock, mouse looks.
    - Movement: WASD **and arrow keys**. Speed constant.
    - Gravity + ground/island collision: sphere vs island tops. No falling off world (clamp).
    - Avatar visible in view (camera slightly behind/above or first-person from sphere).
4. **Fence**
    - Invisible circular (half sphere) world boundary; clamp avatar position.
    - Debug toggle in GUI to visualize boundary wireframe.
5. **Grass**
    - `InstancedMesh` blades on islands, sway via shader (vertex sin by time).
    - Low count, distributed on island tops.
6. **LoadingManager**
    - Replace seed `LoadingManager(console.log...)` in `main.ts` with onStart/onProgress/onLoad/onError callbacks, log progress to console.
7. Commit Phase 1.

## Phase 2 — Day/Night

- Time clock: 1 minute == 1 hour → full day = 24 minutes.
- Detect day/night phase. No sun/moon visual yet.
- Drive sky color, ambient intensity, cloud tint from current time.
- GUI: show in-game clock time + phase. Optional speed control.

## Phase 3 — Island Travel

- Config-driven island registry (position, radius, ID).
- Super jump: exit jump spot ↔ entry jump spot on another island; launch anim + land.
- Portals: glowing ring mesh; shows a real-time render of target island's portal view (render-to-texture camera). Walk in → teleport.

## Phase 4 — Elemental Shrines

- Imbuement shrine on islands; interact → avatar gains element.
- Element shaders: fire, ice, water, earth, light, dark.
- ShaderMaterial aura/effect on avatar per element; toggle/switch.
- Registry: element → colors/particle/geometry effects.

## Conventions

- Prefer small focused modules under `src/` (one concern per file).
- Use `getScene()`/`getGui()` singletons. GUI folders: Avatar, World, Sky, Time, etc.
- No dead code; remove `// TODO` boilerplate (dummy cube in main.ts) once replaced.
- Run `pnpm lint` + `pnpm fmt` before committing each phase.
