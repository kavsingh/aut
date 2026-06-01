// oxlint-disable eslint/max-lines

import typegpu, { d, std } from "typegpu"

const WORKGROUP_SIZE = 64
const RULE_LOOKUP_WIDTH = 8
const RULE_STOP_CAP = 12

interface WgpuWorldRendererOptions {
	worldCount: number
	generationSize: number
}

interface WorldStepRules {
	ruleLookups: Uint32Array
	transitionRatios: Float32Array
	ruleCounts: Uint32Array
}

interface WgpuWorldRenderer {
	seed: (cells: Uint32Array) => void
	step: (rules: WorldStepRules) => void
	renderCurrent: () => void
}

function isRulePayloadValid(
	rules: WorldStepRules,
	expected: {
		lookupSize: number
		ratioSize: number
		worldCount: number
	},
) {
	return (
		rules.ruleLookups.length === expected.lookupSize &&
		rules.transitionRatios.length === expected.ratioSize &&
		rules.ruleCounts.length === expected.worldCount
	)
}

function selectRuleStopIndex(ratios: number[], ratio: number) {
	if (ratios.length <= 1) return 0

	let selected = 0
	for (let i = 1; i < ratios.length; i++) {
		const threshold = ratios[i]
		if (threshold !== undefined && ratio >= threshold) selected = i
	}

	return selected
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
	const ruleLookupSize = options.worldCount * RULE_STOP_CAP * RULE_LOOKUP_WIDTH
	const transitionRatioSize = options.worldCount * RULE_STOP_CAP

	context.configure({
		device: gpu,
		format: canvasFormat,
		alphaMode: "premultiplied",
	})

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

	const ruleLookupsSchema = d.arrayOf(d.u32, ruleLookupSize)
	const transitionRatiosSchema = d.arrayOf(d.f32, transitionRatioSize)
	const ruleCountsSchema = d.arrayOf(d.u32, options.worldCount)

	const ruleLookups = root
		.createBuffer(ruleLookupsSchema)
		.$usage("storage")
		.$name("Rule lookup table")
	const transitionRatios = root
		.createBuffer(transitionRatiosSchema)
		.$usage("storage")
		.$name("Transition ratios")
	const ruleCounts = root
		.createBuffer(ruleCountsSchema)
		.$usage("storage")
		.$name("Rule counts")

	cellStorage[0].write(new Uint32Array(totalCells).buffer)
	cellStorage[1].write(new Uint32Array(totalCells).buffer)

	ruleLookups.write(new Uint32Array(ruleLookupSize).buffer)
	transitionRatios.write(new Float32Array(transitionRatioSize).buffer)
	ruleCounts.write(new Uint32Array(options.worldCount).buffer)

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
			ruleLookups: {
				storage: ruleLookupsSchema,
				access: "readonly",
				visibility: ["compute"],
			},
			transitionRatios: {
				storage: transitionRatiosSchema,
				access: "readonly",
				visibility: ["compute"],
			},
			ruleCounts: {
				storage: ruleCountsSchema,
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
			ruleLookups,
			transitionRatios,
			ruleCounts,
		}),
		root.createBindGroup(bindGroupLayout, {
			grid: gridBuffer,
			sim: simBuffer,
			cellStateIn: cellStorage[1],
			cellStateOut: cellStorage[0],
			ruleLookups,
			transitionRatios,
			ruleCounts,
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
			const stepCounter = bindGroupLayout.$.sim.x
			const virtualRow = std.mod(stepCounter, worldHeight)
			const ratioDenominator = std.max(d.u32(1), std.sub(worldHeight, d.u32(1)))
			const rowRatio = std.div(d.f32(virtualRow), d.f32(ratioDenominator))

			const worldStopBase = std.mul(worldIndex, d.u32(RULE_STOP_CAP))
			const worldRuleCount = d.u32(bindGroupLayout.$.ruleCounts[worldIndex])
			let selectedStop = d.u32(0)

			for (let stop = 1; stop < RULE_STOP_CAP; stop++) {
				const stopU = d.u32(stop)
				if (stopU >= worldRuleCount) continue

				const ratio = d.f32(
					bindGroupLayout.$.transitionRatios[std.add(worldStopBase, stopU)],
				)

				if (rowRatio >= ratio) {
					selectedStop = stopU
				}
			}

			const selectedRuleBase = std.mul(
				std.add(worldStopBase, selectedStop),
				d.u32(RULE_LOOKUP_WIDTH),
			)
			let nextValue = d.u32(
				bindGroupLayout.$.ruleLookups[std.add(selectedRuleBase, pattern)],
			)
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

	function step(rules: WorldStepRules) {
		if (
			!isRulePayloadValid(rules, {
				lookupSize: ruleLookupSize,
				ratioSize: transitionRatioSize,
				worldCount: options.worldCount,
			})
		) {
			return
		}

		ruleLookups.write(rules.ruleLookups)
		transitionRatios.write(rules.transitionRatios)
		ruleCounts.write(rules.ruleCounts)
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
	isRulePayloadValid,
	selectRuleStopIndex,
	shouldInjectPulse,
	RULE_LOOKUP_WIDTH,
	RULE_STOP_CAP,
}
export type { WgpuWorldRenderer, WgpuWorldRendererOptions, WorldStepRules }
