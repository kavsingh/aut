---
name: typegpu
description: "TypeGPU and tgpu workflow guidance for this repo. Use when working on WebGPU shaders, use gpu callbacks, bindGroupLayout resources, accessors, compute/render pipelines, and ResolutionError debugging. Includes tsgo/no-tsover-safe patterns and known gotchas."
argument-hint: "Describe the TypeGPU task (e.g. migrate shader, fix ResolutionError, refactor bind groups)."
user-invocable: true
---

# TypeGPU Skill

Use this skill for TypeGPU or tgpu work in this repository.

## When To Use

- Refactoring WebGPU code to TypeGPU.
- Writing or debugging use gpu callbacks.
- Creating or wiring bind group layouts and pipelines.
- Diagnosing ResolutionError, MissingBindGroupsError, or shader-generation failures.
- Making TypeGPU changes while avoiding tsover (this repo uses tsgo and does not rely on operator overloading).

## Repository Baseline

- TypeGPU is already configured in this project through dependencies and Vite plugin setup.
- The GPU page in this repo lives in src/pages/scrollsgpu/renderer.ts.
- Prefer preserving the current TypeGPU-first architecture unless explicitly asked to roll back.

## Workflow

1. Read the target renderer/module and identify whether code runs inside use gpu callbacks.
2. Ensure all GPU resources used in callbacks are declared in .$uses({...}).
3. Prefer bindGroupLayout.$.resource access inside use gpu bodies.
4. Keep host-side setup typed with tgpu bind groups, buffers, and pipelines.
5. Run file diagnostics after edits, then run project lint/test commands if requested.

## Gotchas In This Repo

- Do not use ?? inside use gpu callbacks.
  The current TypeGPU path in this repo throws ResolutionError for nullish coalescing in generated functions.

- WGSL caveat: || is boolean-only.
  Even though TypeGPU accepts logical operators, generated WGSL only allows `||` for booleans.
  Do not use `value || fallback` for numeric storage reads such as u32.

- Avoid relying on operator overloading semantics.
  Because this repo avoids tsover, prefer std.add/std.sub/std.mul/std.div/std.mod in shader logic where operator transforms are expected.

- Make conversions explicit.
  TypeGPU may warn about implicit conversions such as u32 to f32. Use explicit casts with d.f32(...) and d.u32(...).

- Prefer bindGroupLayout.$ over deprecated layout.bound access.
  The TypeGPU API marks bound as deprecated; default to layout.$ for shader-visible references.

- Be careful with accessor/mutableAccessor defaults for large array schemas.
  In this repo, wrapping bindGroup entries in accessors caused ResolutionError about array schema called with undefined.
  Prefer direct bindGroupLayout.$ usage in shader callbacks unless there is a strong need for accessor indirection.

- Prefer typed numeric reads over non-null assertions for storage indexing.
  Example pattern: `d.u32(layout.$.buffer[idx])` or a helper function that returns that value.
  This avoids `!` in use gpu callbacks without relying on unsupported/defaulting operators.

- Linting caveat for defaults.
  General TS lint rules may recommend ??, but use gpu callbacks in this repo cannot use ??.
  Prefer explicit typed conversion or branch logic instead of nullish/coalescing operators.

## Patterns That Work Well Here

- Compute/read-write ping-pong buffers via two bind groups and alternating with step parity.
- Compute pipeline dispatch first, then render pass draw using the opposite bind group for next frame.
- Keep helper functions small and explicitly typed in TypeGPU function shells.

## External References

- Official docs home: https://docs.swmansion.com/TypeGPU/
- Accessors API: https://docs.swmansion.com/TypeGPU/docs/apis/accessors/
- Bind groups API: https://docs.swmansion.com/TypeGPU/docs/apis/bind-groups/
- Pipelines API: https://docs.swmansion.com/TypeGPU/docs/apis/pipelines/
- WebGPU interoperability guide: https://docs.swmansion.com/TypeGPU/docs/integration/webgpu-interoperability/
- Upstream repository: https://github.com/software-mansion/TypeGPU

## Upstream Examples Worth Mirroring

- Use layout.$ resources in shader functions and ensure pipeline.with(bindGroup) before dispatch/draw.
- Keep bind group definitions centralized and resource names stable.
- Use typed schemas for storage/uniform buffers and explicit access modes.
