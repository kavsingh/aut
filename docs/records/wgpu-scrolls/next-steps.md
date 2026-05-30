# Next Steps: wgpu-scrolls

## Short Term

1. Add UI controls for transition timings (`hold`, `blend`) and world count.
2. Add UI controls to edit rule sequence dynamically (add/remove/reorder).
3. Add a performance overlay (FPS + update timing) for quick regression checks.

## Medium Term

1. Prototype compute-shader evolution for one generation per tick while preserving sequential time progression.
2. Compare CPU-vs-GPU evolution outputs over fixed seeds to verify parity.
3. Reuse `renderer-wgpu-worlds` for `wgpu-construct` route and map slider zones to rule uniforms/buffers.

## Validation

1. Add snapshot-style tests for deterministic transition sequencing.
2. Add integration checks for route mount/unmount resource cleanup.
3. Add stress benchmark scenario for high-density (`CELL_DIM=1`) rendering.
