@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(1) var<storage, read> cellStateIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

fn cellIndex(cell: vec2u) -> u32 {
    return (cell.y % u32(grid.y)) * u32(grid.x) + (cell.x % u32(grid.x));
}

fn cellValue(x: u32, y: u32) -> u32 {
    return cellStateIn[cellIndex(vec2(x, y))];
}

@compute @workgroup_size(8, 8) // 64 total
fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
    let idx = cellIndex(cell.xy);

    let tt = cellValue(cell.x, cell.y + 1);
    let bb = cellValue(cell.x, cell.y - 1);

    let tr = cellValue(cell.x + 1, cell.y + 1);
    let rr = cellValue(cell.x + 1, cell.y);
    let br = cellValue(cell.x + 1, cell.y - 1);

    let tl = cellValue(cell.x - 1, cell.y + 1);
    let ll = cellValue(cell.x - 1, cell.y);
    let bl = cellValue(cell.x - 1, cell.y - 1);

    let activeNeighbourCount = tt + bb + tr + rr + br + tl + ll + bl;

    switch activeNeighbourCount {case 3u: {
        cellStateOut[idx] = 1u;
    }case 2u: {
        cellStateOut[idx] = cellStateIn[idx];
    }default: {
        cellStateOut[idx] = 0u;
    }}
}
