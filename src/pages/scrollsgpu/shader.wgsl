struct VertexInput {
    @location(0) pos: vec2f,
    @builtin(instance_index) instance: u32,
}

struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) cell: vec2f,
}

@group(0) @binding(0) var<uniform> grid: vec2f;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    let i = f32(input.instance);

    let targetCell = vec2f(i % grid.x, floor(i / grid.y));
    let targetOffset = (targetCell / grid) * 2;
    let gridPos = (((input.pos + 1) / grid) - 1) + targetOffset;

    var output: VertexOutput;

    output.pos = vec4f(gridPos, 0, 1);
    output.cell = targetCell;

    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    let rg = input.cell / grid;

    return vec4f(rg, 1 - rg.r, 1);
}
