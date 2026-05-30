# Decision Record: wgpu-scrolls

## Date

2026-05-30

## Context

The new `wgpu-scrolls` route reproduces sequential 1D cellular-automata behavior with animated rule transitions, while using WebGPU for rendering.

## Decisions

- Keep evolution/state updates on the main thread for now to preserve exact row-by-row semantics from existing routes.
- Use a reusable WebGPU renderer (`renderer-wgpu-worlds`) so future routes (including a later `wgpu-construct`) can share rendering infrastructure.
- Set WebGPU route cell size to `1` for maximum detail and visual parity with a dense pixel-grid aesthetic.

## Why

- Temporal dependency between generations limits full time-axis parallelization without changing behavior.
- CPU evolution at current dimensions is straightforward, predictable, and easier to validate.
- Shared renderer reduces duplication and de-risks future migration steps.

## Consequences

- Current solution prioritizes behavior fidelity and maintainability over maximum compute offload.
- High-density rendering increases total cells, which can raise GPU fragment/vertex load at larger dimensions.
- The architecture remains ready for incremental compute-shader migration.
