# WIP Record: wgpu-scrolls

## Date

2026-05-30

## Completed

- Added new route: `src/pages/wgpu-scrolls/index.tsx`.
- Added reusable WebGPU renderer: `src/renderers/renderer-wgpu-worlds.ts`.
- Added route registration and nav entry.
- Implemented animated transitions across an arbitrary rule sequence.
- Updated cell size to `1` for WebGPU path:
  - Simulation density uses `CELL_DIM = 1`.
  - Renderer now draws full-size quads (`-1..1` local cell footprint).

## In Progress

- Validate perceptual quality/performance on slower GPUs at larger viewport sizes.
- Tune transition timing defaults for readability vs motion speed.

## Notes

- Evolution remains CPU-side for deterministic parity with existing sequential logic.
- Rendering is GPU-side and reusable for future WebGPU routes.
