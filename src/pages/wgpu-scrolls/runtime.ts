// oxlint-disable eslint/max-lines

import { allRules } from "~/lib/rules"
import { valueEq } from "~/lib/util"
import { generateInitialWorld, seedRandom } from "~/lib/world"
import {
	createWgpuWorldRenderer,
	RULE_LOOKUP_WIDTH,
	RULE_STOP_CAP,
} from "~/renderers/renderer-wgpu-worlds"
import { writeWorldRuleStops } from "~/renderers/wgpu-rule-payload"

import type { EvolutionRule, WorldState } from "~/lib/types"
import type { RuleStop } from "~/renderers/wgpu-rule-payload"

const WORLD_COUNT = 1
const CELL_DIM = 1
const UPDATE_INTERVAL_MS = 14
const STEPS_PER_UPDATE = 2
const AUDIO_STEP_MODULO = 2
const TRANSITION_HOLD_MS = 1100
const TRANSITION_BLEND_MS = 500
const STAGNATION_RESEED_RUN = 24

const CONFIG = {
	worldCount: WORLD_COUNT,
	cellDim: CELL_DIM,
	updateIntervalMs: UPDATE_INTERVAL_MS,
	stepsPerUpdate: STEPS_PER_UPDATE,
	audioStepModulo: AUDIO_STEP_MODULO,
	transitionHoldMs: TRANSITION_HOLD_MS,
	transitionBlendMs: TRANSITION_BLEND_MS,
}

type RuleName = keyof typeof allRules

interface TransitionSample {
	fromName: RuleName
	toName: RuleName
	fromRule: EvolutionRule
	toRule: EvolutionRule
	progress: number
}

interface WgpuScrollsRuntime {
	toggleAudio: () => void
	stop: () => Promise<void>
}

interface PerfSnapshot {
	fps: number
	ups: number
	renderMs: number
	updateMs: number
	cellCount: number
}

interface RuntimeHooks {
	onUnsupported: (message: string) => void
	onRenderSample: (sample: { renderMs: number; cellCount: number }) => void
	onUpdateSample: (sample: { updateMs: number }) => void
	audio: {
		update: (world: WorldState) => void
		toggle: () => void
		dispose: () => Promise<void>
	}
}

interface CanvasTargets {
	primary: HTMLCanvasElement
	mirrors: CanvasRenderingContext2D[]
}

const SCROLL_STOP_COUNT = 4
const RULE_POOL: readonly RuleName[] = [
	"rule3",
	"rule18",
	"rule45",
	"rule57",
	"rule73",
	"rule90",
	"rule160",
	"rule182",
	"rule225",
]

interface AnimatedRuleQueue {
	stops: RuleStop[]
	spacing: number
}

function sampleRuleName(
	pool: readonly RuleName[],
	exclude: readonly RuleName[] = [],
) {
	if (pool.length === 0) return "rule3"

	const filtered = pool.filter((rule) => {
		return !exclude.includes(rule)
	})
	const source = filtered.length > 0 ? filtered : pool

	const index = Math.floor(Math.random() * source.length)

	return source[index] ?? "rule3"
}

function createAnimatedRuleQueue(
	sequence: readonly RuleName[],
	stopCount: number,
): AnimatedRuleQueue {
	const safeSequence =
		sequence.length > 0 ? sequence : (["rule3"] as RuleName[])
	const spacing = 1 / Math.max(1, stopCount - 1)
	const stops: RuleStop[] = []

	for (let i = 0; i < stopCount; i++) {
		const previous = stops.at(-1)?.[0]
		const rule = sampleRuleName(safeSequence, previous ? [previous] : [])

		stops.push([rule, i * spacing])
	}

	return {
		stops,
		spacing,
	}
}

function advanceAnimatedRuleQueue(
	queue: AnimatedRuleQueue,
	sequence: readonly RuleName[],
	ratioDelta: number,
) {
	const safeSequence =
		sequence.length > 0 ? sequence : (["rule3"] as RuleName[])

	queue.stops = queue.stops.map(([rule, ratio]) => {
		return [rule, ratio - ratioDelta]
	})

	while ((queue.stops[0]?.[1] ?? 0) <= 0 && queue.stops.length > 1) {
		queue.stops.shift()

		const previous = queue.stops.at(-1)?.[0]
		const nextRule = sampleRuleName(safeSequence, previous ? [previous] : [])
		const nextRatio = (queue.stops.at(-1)?.[1] ?? 0) + queue.spacing

		queue.stops.push([nextRule, nextRatio])
	}
}

function selectRuleForRowRatio(stops: readonly RuleStop[], rowRatio: number) {
	let selected = stops[0]?.[0] ?? "rule3"

	for (let i = 1; i < stops.length; i++) {
		const current = stops[i]
		if (!current) continue

		const [rule, threshold] = current

		if (rowRatio >= threshold) {
			selected = rule
		}
	}

	return selected
}

function evolveGeneration(
	current: number[],
	transition: TransitionSample,
	_noiseSeed: number,
) {
	const next = Array.from<number>({ length: current.length }).fill(0)
	const useToRule = transition.progress >= 0.5

	for (let i = 0; i < current.length; i++) {
		const left = current[(i - 1 + current.length) % current.length] ?? 0
		const center = current[i] ?? 0
		const right = current[(i + 1) % current.length] ?? 0
		const fromValue = transition.fromRule(left, center, right)
		const toValue = transition.toRule(left, center, right)

		if (fromValue === toValue || transition.progress <= 0) {
			next[i] = fromValue
			continue
		}

		if (transition.progress >= 1) {
			next[i] = toValue
			continue
		}

		next[i] = useToRule ? toValue : fromValue
	}

	return next
}

function isLowDiversityGeneration(generation: number[]) {
	const length = generation.length
	if (length <= 1) return true

	let ones = 0
	let transitions = 0

	for (let i = 0; i < length; i++) {
		const current = generation[i] ?? 0
		if (current === 1) ones += 1

		const previous = generation[(i - 1 + length) % length] ?? 0
		if (current !== previous) transitions += 1
	}

	const fillRatio = ones / length
	const minTransitions = Math.max(1, Math.floor(length * 0.06))

	return fillRatio <= 0.08 || fillRatio >= 0.92 || transitions <= minTransitions
}

function evolveWorld(args: {
	world: WorldState
	transition: TransitionSample
	noiseSeed: number
	shouldReseed: boolean
}) {
	const { world, transition, noiseSeed, shouldReseed } = args
	const currentGeneration = world.at(-1)

	if (!currentGeneration) {
		return { world, isStable: false }
	}

	const maxGenerations = world.length
	const nextGeneration = evolveGeneration(
		currentGeneration,
		transition,
		noiseSeed,
	)
	const isStable = valueEq(currentGeneration, nextGeneration)
	const isStagnant = isStable || isLowDiversityGeneration(nextGeneration)
	const generation =
		isStagnant && shouldReseed
			? seedRandom(currentGeneration.length)
			: nextGeneration
	const nextWorld = world.concat([generation])

	if (nextWorld.length > maxGenerations) nextWorld.shift()

	return { world: nextWorld, isStagnant }
}

function flattenWorlds(worlds: WorldState[], into: Uint32Array) {
	let ptr = 0

	for (const world of worlds) {
		for (const generation of world) {
			for (const cell of generation) {
				into[ptr] = cell
				ptr += 1
			}
		}
	}
}

async function getDevice() {
	const adapter = await navigator.gpu.requestAdapter()

	if (!adapter) throw new Error("No WebGPU adapter available")

	return adapter.requestDevice()
}

function createCanvasTargets(canvases: HTMLCanvasElement[]): CanvasTargets {
	if (canvases.length === 0) {
		throw new Error("At least one canvas is required")
	}

	const primaryIndex = Math.floor(canvases.length / 2)
	const primary = canvases[primaryIndex] ?? canvases[0]
	if (!primary) throw new Error("No primary canvas available")

	const mirrors = canvases
		.filter((_, index) => index !== primaryIndex)
		.map((canvas) => canvas.getContext("2d"))
		.filter((ctx): ctx is CanvasRenderingContext2D => !!ctx)

	return { primary, mirrors }
}

async function createRuntime(
	canvases: HTMLCanvasElement[],
	hooks: RuntimeHooks,
) {
	const targets = createCanvasTargets(canvases)
	const context = targets.primary.getContext("webgpu")

	if (!context) {
		hooks.onUnsupported("Unable to create a WebGPU context")
		return undefined
	}

	const displayWorldCount = Math.max(1, canvases.length)
	const worldDim = Math.min(
		Math.floor(window.innerWidth / displayWorldCount),
		300,
	)
	const generationSize = Math.floor(worldDim / CONFIG.cellDim)

	for (const canvas of canvases) {
		canvas.width = worldDim
		canvas.height = worldDim
	}

	let renderer: ReturnType<typeof createWgpuWorldRenderer> | undefined =
		undefined

	try {
		const device = await getDevice()
		renderer = createWgpuWorldRenderer(device, context, {
			worldCount: CONFIG.worldCount,
			generationSize,
		})
	} catch {
		hooks.onUnsupported("WebGPU is not available in this browser")
		return undefined
	}

	const initialWorlds = Array.from({ length: CONFIG.worldCount }, () =>
		generateInitialWorld(generationSize, generationSize, seedRandom),
	)
	let audioWorld = generateInitialWorld(
		generationSize,
		generationSize,
		seedRandom,
	)
	const flatState = new Uint32Array(
		CONFIG.worldCount * generationSize * generationSize,
	)
	const ruleLookups = new Uint32Array(
		CONFIG.worldCount * RULE_STOP_CAP * RULE_LOOKUP_WIDTH,
	)
	const transitionRatios = new Float32Array(CONFIG.worldCount * RULE_STOP_CAP)
	const ruleCounts = new Uint32Array(CONFIG.worldCount)
	const reseedFlags = new Uint32Array(CONFIG.worldCount)
	const stableRuns = Array.from<number>({ length: CONFIG.worldCount }).fill(0)
	let step = 0
	let running = true
	let frameId = 0
	const transitionSegmentTicks = Math.max(
		1,
		Math.floor(generationSize / CONFIG.worldCount),
	)
	const ruleQueues = Array.from({ length: CONFIG.worldCount }, () => {
		return createAnimatedRuleQueue(RULE_POOL, SCROLL_STOP_COUNT)
	})
	const queueRatioDelta = 1 / Math.max(1, transitionSegmentTicks)

	flattenWorlds(initialWorlds, flatState)
	renderer.seed(flatState)
	renderer.renderCurrent()

	const updateInterval = setInterval(() => {
		if (!running) return
		const updateStart = performance.now()

		for (let subStep = 0; subStep < CONFIG.stepsPerUpdate; subStep++) {
			const currentStep = step + subStep
			reseedFlags.fill(0)
			const ratioDenominator = Math.max(1, generationSize - 1)
			const rowRatio = (currentStep % generationSize) / ratioDenominator

			for (let i = 0; i < CONFIG.worldCount; i++) {
				const queue = ruleQueues[i]
				if (queue) {
					advanceAnimatedRuleQueue(queue, RULE_POOL, queueRatioDelta)

					writeWorldRuleStops({
						worldIndex: i,
						stops: queue.stops,
						ruleLookups,
						transitionRatios,
						ruleCounts,
						stopCap: RULE_STOP_CAP,
						lookupWidth: RULE_LOOKUP_WIDTH,
					})
				}
				const activeRuleName = selectRuleForRowRatio(
					queue?.stops ?? [],
					rowRatio,
				)
				const activeRule = allRules[activeRuleName]
				const transition: TransitionSample = {
					fromName: activeRuleName,
					toName: activeRuleName,
					fromRule: activeRule,
					toRule: activeRule,
					progress: 0,
				}

				if (i === 0 && subStep % CONFIG.audioStepModulo === 0) {
					const stableRun = stableRuns[i] ?? 0
					const shouldReseed = stableRun >= STAGNATION_RESEED_RUN - 1
					const evolved = evolveWorld({
						world: audioWorld,
						transition,
						noiseSeed: step + Math.imul(i + 1, 1_013_904_223),
						shouldReseed,
					})

					audioWorld = evolved.world

					if (evolved.isStagnant) {
						reseedFlags[i] = shouldReseed ? 1 : 0
						stableRuns[i] = shouldReseed ? 0 : stableRun + 1
					} else {
						stableRuns[i] = 0
					}
				}
			}

			renderer.step({
				ruleLookups,
				transitionRatios,
				ruleCounts,
				reseedFlags,
			})

			step += 1
		}

		hooks.audio.update(audioWorld)
		hooks.onUpdateSample({
			updateMs: performance.now() - updateStart,
		})
	}, CONFIG.updateIntervalMs)

	const onFrame = () => {
		if (!running) return
		const frameStart = performance.now()

		renderer.renderCurrent()

		for (const mirror of targets.mirrors) {
			mirror.clearRect(0, 0, worldDim, worldDim)
			mirror.drawImage(targets.primary, 0, 0, worldDim, worldDim)
		}

		hooks.onRenderSample({
			renderMs: performance.now() - frameStart,
			cellCount: flatState.length,
		})

		frameId = requestAnimationFrame(onFrame)
	}

	frameId = requestAnimationFrame(onFrame)

	const stop = async () => {
		running = false
		clearInterval(updateInterval)
		cancelAnimationFrame(frameId)
		await hooks.audio.dispose()
	}

	return {
		toggleAudio: () => {
			hooks.audio.toggle()
		},
		stop,
	} satisfies WgpuScrollsRuntime
}

export { createRuntime }
export type { PerfSnapshot, WgpuScrollsRuntime }
