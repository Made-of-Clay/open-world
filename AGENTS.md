# AGENTS.md — Onboarding for Agent Instances

Agent-agnostic. Applies to any agent, CLI or IDE, reading this repo fresh.

## Project

Open-world exploration demo: Three.js + TypeScript + Vite (pnpm). User-controlled sphere avatar on floating islands.

- `README.md` — product intent, phase breakdown, CICD.
- `PLAN.md` — implementation plan. **Follow phases in order.** Commit at end of each phase.
- `docs/` — static assets only.
- Stack: `three` (^0.185), `typescript`, `vite`, `oxlint`, `oxfmt`, `lil-gui`.

## Commands

```bash
pnpm i         # install
pnpm dev       # dev server
pnpm build     # typecheck + build
pnpm preview   # serve build
pnpm lint      # oxlint
pnpm fmt       # oxfmt
pnpm lint:fix  # oxlint --fix
```

Run `pnpm lint` and `pnpm fmt` before each commit.

## Code Style — READ FIRST

- **Terse English.** Short sentences, no filler, no politeness, no restating the obvious.
- **No descriptive comments.** Comments explain *why* or *ambiguous code* only. Never *what* the code does. If a comment restates the code, delete it.
- **Self-documenting code over comments.** Names carry meaning. Extract variables/functions instead of annotating.
- Few comments beats many. Prefer zero for clear code.
- Docs: same rule — concise, factual, no preamble.

## Conventions

- Small focused modules under `src/` — one concern per file.
- Use `getScene()` / `getGui()` singletons. GUI folders by feature: Avatar, World, Sky, Time.
- Deterministic, hand-placed world data (stable across runs, phases).
- No dead code. Remove boilerplate/TODO stubs once replaced.
- Work in small increments; verify with `pnpm build` + `pnpm lint`.

## Process

1. Read `PLAN.md` first. Start at the current phase.
2. Make changes. Keep them minimal and focused.
3. Run `pnpm lint` + `pnpm fmt` + `pnpm build`.
4. Commit at the end of each phase.
