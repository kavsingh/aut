// oxlint-disable eslint/max-lines

import typegpu, { d, std } from "typegpu"

const WORKGROUP_SIZE = 64

interface WgpuWorldRendererOptions {
	worldCount: number
	generationSize: number
}

interface WorldStepTransition {
	fromLookup: Uint32Array
	toLookup: Uint32Array
	progress: Float32Array
}

interface WgpuWorldRenderer {
	seed: (cells: Uint32Array) => void
	step: (transition: WorldStepTransition) => void
	renderCurrent: () => void
}

function isTransitionPayloadValid(
	transition: WorldStepTransition,
	expectedTransitionSize: number,
	expectedWorldCount: number,
) {
	return (
		transition.fromLookup.length === expectedTransitionSize &&
		transition.toLookup.length === expectedTransitionSize &&
		transition.progress.length === expectedWorldCount
	)
}

function selectHorizontalTransitionValue(
	fromValue: number,
	toValue: number,
	progress: number,
) {
	if (progress <= 0) return fromValue
	if (progress >= 1) return toValue

	return progress >= 0.5 ? toValue : fromValue
}

function shouldInjectPulse(sample: {
	nextValue: number
	stepCounter: number
	reseedStride: number
	col: number
	worldIndex: number
	worldWidth: number
}) {
	const { nextValue, stepCounter, reseedStride, col, worldIndex, worldWidth } =
		sample

	if (nextValue !== 0) return false
	if (worldWidth <= 0 || reseedStride <= 0) return false

	const pulseActive = stepCounter % reseedStride === 0
	const pulseCol = (col + worldIndex * 17) % worldWidth

	return pulseActive && pulseCol === 0
}

function createWgpuWorldRenderer(
	device: GPUDevice,
	context: GPUCanvasContext,
	options: WgpuWorldRendererOptions,
): WgpuWorldRenderer {
	const root = typegpu.initFromDevice({ device })
	const gpu = root.device
	const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

	const totalCells =
		options.generationSize * options.generationSize * options.worldCount
	const transitionSize = options.worldCount * 8

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

	const simBuffer = root
		.createBuffer(d.vec2u, d.vec2u(0, 97))
		.$usage("uniform")
		.$name("Simulation uniforms")

	const cellSchema = d.arrayOf(d.u32, totalCells)
	const cellStorage = [
		root.createBuffer(cellSchema).$usage("storage").$name("World cells A"),
		root.createBuffer(cellSchema).$usage("storage").$name("World cells B"),
	] as const

	const transitionLookupSchema = d.arrayOf(d.u32, transitionSize)
	const transitionProgressSchema = d.arrayOf(d.f32, options.worldCount)

	const transitionFrom = root
		.createBuffer(transitionLookupSchema)
		.$usage("storage")
		.$name("Transition from lookup")
	const transitionTo = root
		.createBuffer(transitionLookupSchema)
		.$usage("storage")
		.$name("Transition to lookup")
	const transitionProgress = root
		.createBuffer(transitionProgressSchema)
		.$usage("storage")
		.$name("Transition progress")

	cellStorage[0].write(new Uint32Array(totalCells).buffer)
	cellStorage[1].write(new Uint32Array(totalCells).buffer)

	transitionFrom.write(new Uint32Array(transitionSize).buffer)
	transitionTo.write(new Uint32Array(transitionSize).buffer)
	transitionProgress.write(new Float32Array(options.worldCount).buffer)

	const bindGroupLayout = typegpu
		.bindGroupLayout({
			grid: {
				uniform: d.vec3f,
				visibility: ["vertex", "compute"],
			},
			sim: {
				uniform: d.vec2u,
				visibility: ["compute"],
			},
			cellStateIn: {
				storage: cellSchema,
				access: "readonly",
				visibility: ["vertex", "compute"],
			},
			cellStateOut: {
				storage: cellSchema,
				access: "mutable",
				visibility: ["compute"],
			},
			transitionFrom: {
				storage: transitionLookupSchema,
				access: "readonly",
				visibility: ["compute"],
			},
			transitionTo: {
				storage: transitionLookupSchema,
				access: "readonly",
				visibility: ["compute"],
			},
			transitionProgress: {
				storage: transitionProgressSchema,
				access: "readonly",
				visibility: ["compute"],
			},
		})
		.$idx(0)
		.$name("World render bind group")

	const bindGroups = [
		root.createBindGroup(bindGroupLayout, {
			grid: gridBuffer,
			sim: simBuffer,
			cellStateIn: cellStorage[0],
			cellStateOut: cellStorage[1],
			transitionFrom,
			transitionTo,
			transitionProgress,
		}),
		root.createBindGroup(bindGroupLayout, {
			grid: gridBuffer,
			sim: simBuffer,
			cellStateIn: cellStorage[1],
			cellStateOut: cellStorage[0],
			transitionFrom,
			transitionTo,
			transitionProgress,
		}),
	] as const

	const readCell = typegpu
		.fn(
			[d.u32],
			d.u32,
		)((index) => {
			"use gpu"
			return d.u32(bindGroupLayout.$.cellStateIn[index])
		})
		.$uses({ bindGroupLayout })
		.$name("Read world cell")

	const computeMain = typegpu
		.computeFn({
			in: { cell: d.builtin.globalInvocationId },
			workgroupSize: [WORKGROUP_SIZE],
		})((input) => {
			"use gpu"

			const total = d.u32(totalCells)
			const idx = input.cell.x

			if (idx >= total) return

			const worldWidth = d.u32(bindGroupLayout.$.grid.x)
			const worldHeight = d.u32(bindGroupLayout.$.grid.y)
			const cellsPerWorld = std.mul(worldWidth, worldHeight)
			const worldIndex = d.u32(
				std.floor(std.div(d.f32(idx), d.f32(cellsPerWorld))),
			)
			const local = d.u32(std.mod(d.f32(idx), d.f32(cellsPerWorld)))
			const row = d.u32(std.floor(std.div(d.f32(local), d.f32(worldWidth))))
			const col = d.u32(std.mod(d.f32(local), d.f32(worldWidth)))

			if (row < std.sub(worldHeight, d.u32(1))) {
				bindGroupLayout.$.cellStateOut[idx] = d.u32(
					bindGroupLayout.$.cellStateIn[std.add(idx, worldWidth)],
				)
				return
			}

			const worldOffset = std.mul(worldIndex, cellsPerWorld)
			const lastRowOffset = std.add(
				worldOffset,
				std.mul(std.sub(worldHeight, d.u32(1)), worldWidth),
			)

			const leftCol = d.u32(
				std.mod(
					std.add(d.f32(col), std.sub(d.f32(worldWidth), 1)),
					d.f32(worldWidth),
				),
			)
			const rightCol = d.u32(std.mod(std.add(d.f32(col), 1), d.f32(worldWidth)))

			const left = d.u32(
				bindGroupLayout.$.cellStateIn[std.add(lastRowOffset, leftCol)],
			)
			const center = d.u32(
				bindGroupLayout.$.cellStateIn[std.add(lastRowOffset, col)],
			)
			const right = d.u32(
				bindGroupLayout.$.cellStateIn[std.add(lastRowOffset, rightCol)],
			)

			const pattern = std.add(
				std.mul(left, d.u32(4)),
				std.add(std.mul(center, d.u32(2)), right),
			)
			const ruleOffset = std.mul(worldIndex, d.u32(8))
			const fromValue = d.u32(
				bindGroupLayout.$.transitionFrom[std.add(ruleOffset, pattern)],
			)
			const toValue = d.u32(
				bindGroupLayout.$.transitionTo[std.add(ruleOffset, pattern)],
			)
			const progress = d.f32(bindGroupLayout.$.transitionProgress[worldIndex])

			if (progress <= 0) {
				let nextValue = fromValue
				const stepCounter = bindGroupLayout.$.sim.x
				const reseedStride = bindGroupLayout.$.sim.y
				const pulseActive =
					std.mod(d.f32(stepCounter), d.f32(reseedStride)) === d.f32(0)
				const pulseCol = std.mod(
					std.add(d.f32(col), std.mul(d.f32(worldIndex), d.f32(17))),
					d.f32(worldWidth),
				)

				if (nextValue === d.u32(0) && pulseActive && pulseCol === d.f32(0)) {
					nextValue = d.u32(1)
				}

				bindGroupLayout.$.cellStateOut[idx] = nextValue
				return
			}

			if (progress >= 1) {
				let nextValue = toValue
				const stepCounter = bindGroupLayout.$.sim.x
				const reseedStride = bindGroupLayout.$.sim.y
				const pulseActive =
					std.mod(d.f32(stepCounter), d.f32(reseedStride)) === d.f32(0)
				const pulseCol = std.mod(
					std.add(d.f32(col), std.mul(d.f32(worldIndex), d.f32(17))),
					d.f32(worldWidth),
				)

				if (nextValue === d.u32(0) && pulseActive && pulseCol === d.f32(0)) {
					nextValue = d.u32(1)
				}

				bindGroupLayout.$.cellStateOut[idx] = nextValue
				return
			}

			let nextValue = fromValue

			if (progress >= d.f32(0.5)) {
				nextValue = toValue
			}
			const stepCounter = bindGroupLayout.$.sim.x
			const reseedStride = bindGroupLayout.$.sim.y
			const pulseActive =
				std.mod(d.f32(stepCounter), d.f32(reseedStride)) === d.f32(0)
			const pulseCol = std.mod(
				std.add(d.f32(col), std.mul(d.f32(worldIndex), d.f32(17))),
				d.f32(worldWidth),
			)

			if (nextValue === d.u32(0) && pulseActive && pulseCol === d.f32(0)) {
				nextValue = d.u32(1)
			}

			bindGroupLayout.$.cellStateOut[idx] = nextValue
		})
		.$uses({ bindGroupLayout, std })
		.$name("World compute")

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

	const computePipeline = root
		.createComputePipeline({ compute: computeMain })
		.$name("World compute pipeline")

	let stepIndex = 0

	function getBindGroup(index: number) {
		return bindGroups[index % 2 === 0 ? 0 : 1]
	}

	function seed(cells: Uint32Array) {
		if (cells.length !== totalCells) return

		cellStorage[0].write(cells)
		cellStorage[1].write(cells)
		stepIndex = 0
	}

	function step(transition: WorldStepTransition) {
		if (
			!isTransitionPayloadValid(transition, transitionSize, options.worldCount)
		) {
			return
		}

		transitionFrom.write(transition.fromLookup)
		transitionTo.write(transition.toLookup)
		transitionProgress.write(transition.progress)
		simBuffer.write(new Uint32Array([stepIndex, 97]))

		const workgroups = Math.ceil(totalCells / WORKGROUP_SIZE)
		const encoder = gpu.createCommandEncoder()

		computePipeline
			.with(encoder)
			.with(getBindGroup(stepIndex))
			.dispatchWorkgroups(workgroups)

		stepIndex += 1
		gpu.queue.submit([encoder.finish()])
	}

	function renderCurrent() {
		const encoder = gpu.createCommandEncoder()

		renderPipeline
			.with(encoder)
			.with(getBindGroup(stepIndex))
			.withColorAttachment({
				view: context,
				loadOp: "clear",
				clearValue: { r: 0, g: 0, b: 0, a: 0 },
				storeOp: "store",
			})
			.draw(6, totalCells)

		gpu.queue.submit([encoder.finish()])
	}

	return { seed, step, renderCurrent }
}

export {
	createWgpuWorldRenderer,
	isTransitionPayloadValid,
	selectHorizontalTransitionValue,
	shouldInjectPulse,
}
export type { WgpuWorldRenderer, WgpuWorldRendererOptions, WorldStepTransition }
