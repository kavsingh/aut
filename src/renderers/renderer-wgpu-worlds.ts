import typegpu, { d, std } from "typegpu"

export interface WgpuWorldRendererOptions {
	worldCount: number
	generationSize: number
}

export interface WgpuWorldRenderer {
	render: (cells: Uint32Array) => void
}

export function createWgpuWorldRenderer(
	device: GPUDevice,
	context: GPUCanvasContext,
	options: WgpuWorldRendererOptions,
): WgpuWorldRenderer {
	const root = typegpu.initFromDevice({ device })
	const gpu = root.device
	const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

	const totalCells =
		options.generationSize * options.generationSize * options.worldCount

	context.configure({ device: gpu, format: canvasFormat })

	const gridBuffer = root
		.createBuffer(
			d.vec3f,
			d.vec3f(
				options.generationSize,
				options.generationSize,
				options.worldCount,
			),
		)
		.$usage("uniform")
		.$name("World grid")

	const cellSchema = d.arrayOf(d.u32, totalCells)
	const cellStorage = root
		.createBuffer(cellSchema)
		.$usage("storage")
		.$name("World cells")

	cellStorage.write(new Uint32Array(totalCells).buffer)

	const bindGroupLayout = typegpu
		.bindGroupLayout({
			grid: {
				uniform: d.vec3f,
				visibility: ["vertex"],
			},
			cellState: {
				storage: cellSchema,
				access: "readonly",
				visibility: ["vertex"],
			},
		})
		.$idx(0)
		.$name("World render bind group")

	const bindGroup = root.createBindGroup(bindGroupLayout, {
		grid: gridBuffer,
		cellState: cellStorage,
	})

	const readCell = typegpu
		.fn(
			[d.u32],
			d.u32,
		)((index) => {
			"use gpu"
			return d.u32(bindGroupLayout.$.cellState[index])
		})
		.$uses({ bindGroupLayout })
		.$name("Read world cell")

	const vertexMain = typegpu
		.vertexFn({
			in: {
				vertexIndex: d.builtin.vertexIndex,
				instance: d.builtin.instanceIndex,
			},
			out: {
				pos: d.builtin.position,
			},
		})((input) => {
			"use gpu"

			const one = d.u32(1)
			const worldWidthF = bindGroupLayout.$.grid.x
			const worldHeightF = bindGroupLayout.$.grid.y
			const worldWidthU = d.u32(worldWidthF)
			const worldHeightU = d.u32(worldHeightF)
			const worldCountF = bindGroupLayout.$.grid.z
			const cellsPerWorldF = std.mul(worldWidthF, worldHeightF)

			const worldIndexU = d.u32(
				std.floor(std.div(d.f32(input.instance), cellsPerWorldF)),
			)
			const cellIndexU = d.u32(std.mod(d.f32(input.instance), cellsPerWorldF))

			const xRaw = d.u32(std.mod(d.f32(cellIndexU), worldWidthF))
			const yRaw = d.u32(std.floor(std.div(d.f32(cellIndexU), worldWidthF)))

			let x = xRaw
			let y = yRaw

			if (std.mod(worldIndexU, d.u32(2)) === one) {
				x = std.sub(std.sub(worldWidthU, one), xRaw)
				y = std.sub(std.sub(worldHeightU, one), yRaw)
			}

			const xGlobal = std.add(std.mul(worldIndexU, worldWidthU), x)
			const state = d.f32(readCell(input.instance))

			let px = d.f32(-1)
			if (
				input.vertexIndex === 1 ||
				input.vertexIndex === 2 ||
				input.vertexIndex === 3
			) {
				px = d.f32(1)
			}

			let py = d.f32(1)
			if (
				input.vertexIndex === 0 ||
				input.vertexIndex === 1 ||
				input.vertexIndex === 5
			) {
				py = d.f32(-1)
			}

			const pos = d.vec2f(px, py)
			const targetCell = d.vec2f(d.f32(xGlobal), d.f32(y))
			const totalGrid = d.vec2f(std.mul(worldWidthF, worldCountF), worldHeightF)
			const targetOffset = std.mul(std.div(targetCell, totalGrid), 2)

			const gridPos = std.add(
				std.sub(std.div(std.add(std.mul(pos, state), 1), totalGrid), 1),
				targetOffset,
			)

			return { pos: d.vec4f(gridPos, 0, 1) }
		})
		.$uses({ bindGroupLayout, readCell, std })
		.$name("World vertex")

	const fragmentMain = typegpu
		.fragmentFn({ out: d.vec4f })(() => {
			"use gpu"
			return d.vec4f(1, 1, 1, 1)
		})
		.$name("World fragment")

	const renderPipeline = root
		.createRenderPipeline({
			vertex: vertexMain,
			fragment: fragmentMain,
			targets: { format: canvasFormat },
		})
		.$name("World render pipeline")

	function render(cells: Uint32Array) {
		if (cells.length !== totalCells) return

		cellStorage.write(cells)

		const encoder = gpu.createCommandEncoder()

		renderPipeline
			.with(encoder)
			.with(bindGroup)
			.withColorAttachment({
				view: context,
				loadOp: "clear",
				clearValue: { r: 0, g: 0, b: 0, a: 0 },
				storeOp: "store",
			})
			.draw(6, totalCells)

		gpu.queue.submit([encoder.finish()])
	}

	return { render }
}
