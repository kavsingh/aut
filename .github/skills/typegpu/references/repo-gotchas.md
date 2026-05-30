# TypeGPU Gotchas For This Repository

This file records behavior observed while migrating src/pages/scrollsgpu/renderer.ts.

## Confirmed Behaviors

- use gpu callbacks reject nullish coalescing (??) with ResolutionError.
- WGSL logical OR (||) is boolean-only; numeric defaults like `u32 || 0u` fail shader compilation.
- Accessor wrappers around bindGroup entry defaults can fail for large array schemas with undefined argument ResolutionError.
- Direct bindGroupLayout.$ access in use gpu callbacks is stable in this project.
- Without tsover, arithmetic operators in TypeScript may not map as expected for shader expressions; std.\* operations are safer.
- Explicit numeric casts reduce warnings and keep generated WGSL predictable.

## Safe Patterns

- Read only (typed): d.u32(bindGroupLayout.$.cellStateIn[idx])
- Mutable write: bindGroupLayout.$.cellStateOut[idx] = value
- Explicit cast examples:
  - const x = d.f32(input.instance)
  - const i = d.u32(std.floor(...))

## Lint Interop

- If lint suggests nullish/coalescing defaults for shader reads, do not apply them in use gpu callbacks.
- Prefer explicit typed conversion helpers or explicit branch logic.

## Debugging Checklist

1. ResolutionError in compute function:
   - Remove unsupported syntax (for example ??) from use gpu callback body.
   - Confirm every external symbol in callback appears in .$uses(...).
   - Prefer bindGroupLayout.$ symbols over accessor indirection.
2. Missing bind groups error:
   - Ensure pipeline.with(bindGroup) is called before draw/dispatch.
3. Type/lint-only issues:
   - Fix with explicit casts and local variables before changing architecture.
