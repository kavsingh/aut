// oxlint-disable no-inline-comments

import typegpu, { d, std } from "typegpu"

const WORKGROUP_SIZE = 8 // sqrt 64
const FRAME_INTERVAL_MS = 16

function seedFirstRowRandom(state: Uint32Array, gridSize: number) {
	for (let i = 0; i < gridSize; ++i) {
		state[i] = Math.random() > 0.6 ? 1 : 0
	}
}

function clearState(state: Uint32Array) {
	state.fill(0)
}

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

	seedFirstRowRandom(cellStateArray, gridSize)

	cellStateStorage[0].write(cellStateArray.buffer)

	clearState(cellStateArray)

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

	const cellIndex = typegpu
		.fn(
			[d.vec2u, d.vec2u],
			d.u32,
		)((pos, size) => {
			"use gpu"
			const py = d.f32(pos.y)
			const sy = d.f32(size.y)
			const px = d.f32(pos.x)
			const sx = d.f32(size.x)

			return d.u32(std.add(std.mul(std.mod(py, sy), sx), std.mod(px, sx)))
		})
		.$name("Cell index helper")

	const readCell = typegpu
		.fn(
			[d.u32],
			d.u32,
		)((index) => {
			"use gpu"
			return d.u32(bindGroupLayout.$.cellStateIn[index])
		})
		.$uses({ bindGroupLayout })
		.$name("Read cell")

	const vertexMain = typegpu
		.vertexFn({
			in: {
				vertexIndex: d.builtin.vertexIndex,
				instance: d.builtin.instanceIndex,
			},
			out: {
				pos: d.builtin.position,
				cell: d.location(0, d.vec2f),
			},
		})((input) => {
			"use gpu"

			const i = d.f32(input.instance)
			const state = d.f32(readCell(input.instance))

			let px = d.f32(-0.8)
			if (
				input.vertexIndex === 1 ||
				input.vertexIndex === 2 ||
				input.vertexIndex === 3
			) {
				px = d.f32(0.8)
			}

			let py = d.f32(0.8)
			if (
				input.vertexIndex === 0 ||
				input.vertexIndex === 1 ||
				input.vertexIndex === 5
			) {
				py = d.f32(-0.8)
			}

			const pos = d.vec2f(px, py)

			const targetCell = d.vec2f(
				std.mod(i, bindGroupLayout.$.grid.x),
				std.floor(std.div(i, bindGroupLayout.$.grid.y)),
			)
			const targetOffset = std.mul(
				std.div(targetCell, bindGroupLayout.$.grid),
				2,
			)
			const gridPos = std.add(
				std.sub(
					std.div(std.add(std.mul(pos, state), 1), bindGroupLayout.$.grid),
					1,
				),
				targetOffset,
			)

			return {
				pos: d.vec4f(gridPos, 0, 1),
				cell: targetCell,
			}
		})
		.$uses({
			bindGroupLayout,
		})
		.$name("Cell vertex shader")

	const fragmentMain = typegpu
		.fragmentFn({ out: d.vec4f })(() => {
			"use gpu"
			return d.vec4f(1, 1, 1, 1)
		})
		.$name("Cell fragment shader")

	const computeMain = typegpu
		.computeFn({
			in: { cell: d.builtin.globalInvocationId },
			workgroupSize: [WORKGROUP_SIZE, WORKGROUP_SIZE],
		})((input) => {
			"use gpu"

			const one = d.u32(1)
			const size = d.vec2u(
				d.u32(bindGroupLayout.$.grid.x),
				d.u32(bindGroupLayout.$.grid.y),
			)
			const x = input.cell.x
			const y = input.cell.y

			const idx = cellIndex(d.vec2u(x, y), size)

			const tt = readCell(cellIndex(d.vec2u(x, std.add(y, one)), size))
			const bb = readCell(cellIndex(d.vec2u(x, std.sub(y, one)), size))

			const tr = readCell(
				cellIndex(d.vec2u(std.add(x, one), std.add(y, one)), size),
			)
			const rr = readCell(cellIndex(d.vec2u(std.add(x, one), y), size))
			const br = readCell(
				cellIndex(d.vec2u(std.add(x, one), std.sub(y, one)), size),
			)

			const tl = readCell(
				cellIndex(d.vec2u(std.sub(x, one), std.add(y, one)), size),
			)
			const ll = readCell(cellIndex(d.vec2u(std.sub(x, one), y), size))
			const bl = readCell(
				cellIndex(d.vec2u(std.sub(x, one), std.sub(y, one)), size),
			)

			const activeNeighbourCount = std.add(
				std.add(std.add(tt, bb), std.add(tr, rr)),
				std.add(std.add(br, tl), std.add(ll, bl)),
			)

			if (activeNeighbourCount === d.u32(3)) {
				bindGroupLayout.$.cellStateOut[idx] = d.u32(1)
			} else if (activeNeighbourCount === d.u32(2)) {
				bindGroupLayout.$.cellStateOut[idx] = readCell(idx)
			} else {
				bindGroupLayout.$.cellStateOut[idx] = d.u32(0)
			}
		})
		.$uses({
			bindGroupLayout,
			cellIndex,
			readCell,
			std,
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

	setInterval(update, FRAME_INTERVAL_MS)
}
