// oxlint-disable no-inline-comments

import typegpu, { d } from "typegpu"

const WORKGROUP_SIZE = 8 // sqrt 64

export function init(
	device: GPUDevice,
	context: GPUCanvasContext,
	gridSize: number,
) {
	const root = typegpu.initFromDevice({ device })
	const gpu = root.device
	const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

	context.configure({ device: gpu, format: canvasFormat })

	const uniformBuffer = root
		.createBuffer(d.vec2f, d.vec2f(gridSize, gridSize))
		.$usage("uniform")
		.$name("Grid uniforms")

	const cellStateArray = new Uint32Array(gridSize * gridSize)
	const cellStateSchema = d.arrayOf(d.u32, gridSize * gridSize)
	const cellStateStorage = [
		root.createBuffer(cellStateSchema).$usage("storage").$name("Cell state A"),
		root.createBuffer(cellStateSchema).$usage("storage").$name("Cell state B"),
	] as const

	for (let i = 0; i < gridSize; ++i) {
		cellStateArray[i] = Math.random() > 0.6 ? 1 : 0
	}

	cellStateStorage[0].write(cellStateArray.buffer)

	for (let i = 0; i < cellStateArray.length; i++) {
		cellStateArray[i] = 0
	}

	cellStateStorage[1].write(cellStateArray.buffer)

	const bindGroupLayout = typegpu
		.bindGroupLayout({
			grid: {
				uniform: d.vec2f,
				visibility: ["vertex", "fragment", "compute"],
			},
			cellStateIn: {
				storage: cellStateSchema,
				access: "readonly",
				visibility: ["vertex", "compute"],
			},
			cellStateOut: {
				storage: cellStateSchema,
				access: "mutable",
				visibility: ["compute"],
			},
		})
		.$idx(0)
		.$name("Cell bind group layout")

	// oxlint-disable-next-line typescript/no-deprecated
	const cellStateIn = bindGroupLayout.bound.cellStateIn
	// oxlint-disable-next-line typescript/no-deprecated
	const cellStateOut = bindGroupLayout.bound.cellStateOut
	// oxlint-disable-next-line typescript/no-deprecated
	const grid = bindGroupLayout.bound.grid

	const bindGroups = [
		root.createBindGroup(bindGroupLayout, {
			grid: uniformBuffer,
			cellStateIn: cellStateStorage[0],
			cellStateOut: cellStateStorage[1],
		}),
		root.createBindGroup(bindGroupLayout, {
			grid: uniformBuffer,
			cellStateIn: cellStateStorage[1],
			cellStateOut: cellStateStorage[0],
		}),
	] as const

	const vertexMain = typegpu.vertexFn({
		in: {
			vertexIndex: d.builtin.vertexIndex,
			instance: d.builtin.instanceIndex,
		},
		out: {
			pos: d.builtin.position,
			cell: d.location(0, d.vec2f),
		},
	}) /* wgsl */ `{
			let i = f32(in.instance);
			let state = f32(cellStateIn[in.instance]);

			let pos = array<vec2f, 6>(
				vec2f(-0.8, -0.8),
				vec2f(0.8, -0.8),
				vec2f(0.8, 0.8),
				vec2f(0.8, 0.8),
				vec2f(-0.8, 0.8),
				vec2f(-0.8, -0.8),
			);

			let targetCell = vec2f(i % grid.x, floor(i / grid.y));
			let targetOffset = (targetCell / grid) * 2;
			let gridPos = ((((pos[in.vertexIndex] * state) + 1) / grid) - 1) + targetOffset;

			return Out(vec4f(gridPos, 0, 1), targetCell);
		}`
		.$uses({
			cellStateIn,
			grid,
		})
		.$name("Cell vertex shader")

	const fragmentMain = typegpu.fragmentFn({ out: d.vec4f }) /* wgsl */ `{
			return vec4f(1, 1, 1, 1);
		}`.$name("Cell fragment shader")

	const computeMain = typegpu.computeFn({
		in: { cell: d.builtin.globalInvocationId },
		workgroupSize: [WORKGROUP_SIZE, WORKGROUP_SIZE],
	}) /* wgsl */ `{
			let gridX = u32(grid.x);
			let gridY = u32(grid.y);
			let x = cell.x;
			let y = cell.y;

			let idx = (y % gridY) * gridX + (x % gridX);

			let tt = cellStateIn[((y + 1u) % gridY) * gridX + (x % gridX)];
			let bb = cellStateIn[((y - 1u) % gridY) * gridX + (x % gridX)];

			let tr = cellStateIn[((y + 1u) % gridY) * gridX + ((x + 1u) % gridX)];
			let rr = cellStateIn[(y % gridY) * gridX + ((x + 1u) % gridX)];
			let br = cellStateIn[((y - 1u) % gridY) * gridX + ((x + 1u) % gridX)];

			let tl = cellStateIn[((y + 1u) % gridY) * gridX + ((x - 1u) % gridX)];
			let ll = cellStateIn[(y % gridY) * gridX + ((x - 1u) % gridX)];
			let bl = cellStateIn[((y - 1u) % gridY) * gridX + ((x - 1u) % gridX)];

			let activeNeighbourCount = tt + bb + tr + rr + br + tl + ll + bl;

			switch activeNeighbourCount {
				case 3u: {
					cellStateOut[idx] = 1u;
				}
				case 2u: {
					cellStateOut[idx] = cellStateIn[idx];
				}
				default: {
					cellStateOut[idx] = 0u;
				}
			}
		}`
		.$uses({
			cellStateIn,
			cellStateOut,
			grid,
		})
		.$name("Game of life compute shader")

	const renderPipeline = root
		.createRenderPipeline({
			vertex: vertexMain,
			fragment: fragmentMain,
			targets: { format: canvasFormat },
		})
		.$name("Render pipeline")

	const simulationPipeline = root
		.createComputePipeline({ compute: computeMain })
		.$name("Simulation pipeline")

	let step = 0

	function getBindGroup(index: number) {
		return bindGroups[index % 2 === 0 ? 0 : 1]
	}

	function update() {
		const encoder = gpu.createCommandEncoder()
		const workgroupCount = Math.ceil(gridSize / WORKGROUP_SIZE)
		const activeBindGroup = getBindGroup(step)

		simulationPipeline
			.with(encoder)
			.with(activeBindGroup)
			// https://codelabs.developers.google.com/your-first-webgpu-app#7
			.dispatchWorkgroups(workgroupCount, workgroupCount)

		step += 1

		renderPipeline
			.with(encoder)
			.with(getBindGroup(step))
			.withColorAttachment({
				view: context,
				loadOp: "clear",
				clearValue: { r: 0, g: 0, b: 0, a: 0 },
				storeOp: "store",
			})
			.draw(6, gridSize * gridSize)

		gpu.queue.submit([encoder.finish()])
	}

	setInterval(update, 16)
}
