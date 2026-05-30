# Full Parallelization Plan: wgpu-scrolls

## Date

2026-05-30

## Goal

Move `wgpu-scrolls` from CPU evolution + GPU render to GPU-driven evolution and GPU render, while preserving visual behavior and deterministic transition semantics.

## Non-Goals

- Rebuilding route UI/interaction model.
- Merging `wgpu-scrolls` and `wgpu-construct` in one step.

## Baseline Today

- CPU updates world state at fixed interval.
- GPU renders flattened world buffers.
- Rule transitions are blended over time with deterministic pseudo-random selection.

## Target Architecture

- Compute pass performs one generation step per world in parallel.
- Storage ping-pong buffers hold current/next generation slices for each world.
- Optional history texture or history buffer stores scrolling rows directly on GPU.
- Render pass reads GPU history state without CPU flattening.
- CPU submits timing uniforms and transition parameters only.

## Constraints

- Temporal dependency remains across generations; full parallelization applies within each generation and across worlds, not across time.
- Transition behavior must remain smooth and configurable for arbitrary sequence lengths.
- Existing audio integration can remain CPU-side initially (sampling one world state), then be optimized later.

## Rollout Plan

### Phase 1: Compute World Step

1. Add compute shader to evaluate one 1D generation for all worlds.
2. Encode rule sequence transition parameters in uniform/storage buffers.
3. Keep CPU flattening path as fallback while validating shader output.

Exit criteria:

- GPU and CPU generation outputs match for fixed seeds and transition settings.
- Stable frame pacing at current world sizes.

### Phase 2: GPU History Buffer

1. Keep last N generations in GPU storage (ring buffer per world).
2. Replace CPU `flattenWorlds` with GPU-side history writes.
3. Update renderer to instance directly from history layout.

Exit criteria:

- CPU no longer copies full world state each frame.
- Route behavior remains visually equivalent.

### Phase 3: Transition Data Model on GPU

1. Move rule transition sampling fully to GPU from elapsed time + sequence buffers.
2. Support arbitrary transition count by dynamic storage buffers.
3. Add route controls for sequence edits with buffer updates only.

Exit criteria:

- Arbitrary rule sequence changes no longer require CPU-side per-cell transition logic.
- No frame spikes from frequent sequence edits.

### Phase 4: Instrumentation + Hardening

1. Add GPU timestamp queries where available.
2. Keep overlay metrics for FPS, UPS, render ms, update ms.
3. Add parity and stress tests in CI for representative dimensions.

Exit criteria:

- Measured improvement versus CPU evolution baseline.
- No regressions in behavior or cleanup on mount/unmount.

## Risk Register

1. Shader complexity risk:

- Transition blending plus sequence lookup may increase shader branch cost.
- Mitigation: precompute compact rule lookup tables and keep branch paths uniform.

2. Memory layout risk:

- Poor buffer layout can cause cache-unfriendly access.
- Mitigation: prototype two layouts (world-major and generation-major) and benchmark.

3. Determinism risk:

- CPU and GPU float/PRNG differences can desync transitions.
- Mitigation: use integer hash/LCG logic in shader and fixed seed uniforms.

4. Feature drift risk:

- `wgpu-scrolls` and future `wgpu-construct` may diverge.
- Mitigation: isolate shared compute/render primitives in reusable renderer modules.

## Validation Matrix

1. Correctness:

- Fixed-seed parity snapshots over 1k updates.
- Transition progress parity at key timestamps.

2. Performance:

- Compare FPS/UPS and mean update/render times across dimensions.
- Record 50th/95th percentile timing over 30-second runs.

3. Stability:

- Mount/unmount leak checks.
- WebGPU unavailable fallback behavior.

## Decision Gates

1. Gate A (after Phase 1):

- If compute parity fails repeatedly, keep CPU evolution and improve renderer-only path.

2. Gate B (after Phase 2):

- If GPU history adds instability, keep compute evolution but preserve CPU flatten fallback.

3. Gate C (after Phase 3):

- If dynamic sequence updates cause spikes, retain CPU transition scheduler with GPU world stepping.

## Estimated Effort

1. Phase 1: 1 to 2 days.
2. Phase 2: 1 to 2 days.
3. Phase 3: 2 to 3 days.
4. Phase 4: 1 day.

Total: 5 to 8 days with parity and instrumentation included.
