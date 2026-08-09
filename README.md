# Open World

This is an open world project aimed at practicing exploration of a space with a given avatar.

## Phase Breakdown

### Phase 1

Open world exploration, very simple avatar character (simple sphere). Floating islands made of half spheres. Pleasant background sky with stylized clouds. Daylight. Collision detection and invisible "fence" boundary. Swaying grass blades.

Loading state tracked and logging progress loading resources (`LoadingManager`).

### Phase 2

Day/night transitions. One minute is one hour. Somehow detect day/night transitions. No sun/moon for now.

### Phase 3

Way to add new islands. Transportation between islands via super jump (exit & entry jump spots) or portal between islands (glowing ring showing other island's portal view).

### Phase 4

Imbument shrines on different islands where shrine imbues avatar with given elemental energies. Element use shaders; fire, ice, water, earth, light, dark, etc.

## CLI Commands

Installation

```bash
pnpm i
```

Run dev mode

```bash
pnpm dev
```

Build

```bash
pnpm build
```

Run build

```bash
pnpm preview
```

## CICD Setup

Ensure your GitHub repo exists before starting.

### Firebase

Firebase is my current static hosting provider.

- Create a site under the playground project.
- run `firebase-tools init hosting:github` and follow the prompts
    - might run `npm config get prefix` to find the bin if PATH isn't configured correctly
- Ensure firebase.json `hosting.site` is entered correctly

### GitHub Actions

- Ensure project builds without error/lint (this breaks/stops builds).
- Push files to remote and what actions for a successful build/deployment.
