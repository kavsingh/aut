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

const WORLD_COUNT = 3
const CELL_DIM = 1
const UPDATE_INTERVAL_MS = 14
const STEPS_PER_UPDATE = 2
const AUDIO_STEP_MODULO = 2
const TRANSITION_HOLD_MS = 1100
const TRANSITION_BLEND_MS = 500

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

const RULE_SEQUENCE: RuleName[] = [
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

const SCROLL_STOP_COUNT = 4

interface AnimatedRuleQueue {
	stops: RuleStop[]
	nextRuleIndex: number
	spacing: number
}

function createAnimatedRuleQueue(
	sequence: readonly RuleName[],
	startIndex: number,
	stopCount: number,
): AnimatedRuleQueue {
	const safeSequence =
		sequence.length > 0 ? sequence : (["rule3"] as RuleName[])
	const normalizedStart =
		((startIndex % safeSequence.length) + safeSequence.length) %
		safeSequence.length
	const spacing = 1 / Math.max(1, stopCount - 1)
	const stops: RuleStop[] = []

	for (let i = 0; i < stopCount; i++) {
		const rule = safeSequence[(normalizedStart + i) % safeSequence.length]

		if (rule) {
			stops.push([rule, i * spacing])
		}
	}

	return {
		stops,
		nextRuleIndex: (normalizedStart + stopCount) % safeSequence.length,
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

		const nextRule = safeSequence[queue.nextRuleIndex] ?? "rule3"
		const nextRatio = (queue.stops.at(-1)?.[1] ?? 0) + queue.spacing

		queue.stops.push([nextRule, nextRatio])
		queue.nextRuleIndex = (queue.nextRuleIndex + 1) % safeSequence.length
	}
}

function sampleTransition(
	sequence: RuleName[],
	elapsedTicks: number,
	transition: { holdTicks: number; blendTicks: number },
): TransitionSample {
	const safeSequence =
		sequence.length > 0 ? sequence : (["rule3"] as RuleName[])
	const segmentTicks = Math.max(1, transition.holdTicks + transition.blendTicks)
	const cycleTicks = segmentTicks * safeSequence.length
	const cycleElapsed = ((elapsedTicks % cycleTicks) + cycleTicks) % cycleTicks
	const segmentIndex = Math.floor(cycleElapsed / segmentTicks)
	const segmentElapsed = cycleElapsed % segmentTicks
	const nextIndex = (segmentIndex + 1) % safeSequence.length
	const fromName = safeSequence[segmentIndex] ?? "rule3"
	const toName = safeSequence[nextIndex] ?? "rule3"
	const progress =
		segmentElapsed <= transition.holdTicks || transition.blendTicks <= 0
			? 0
			: Math.min(
					1,
					(segmentElapsed - transition.holdTicks) / transition.blendTicks,
				)

	return {
		fromName,
		toName,
		fromRule: allRules[fromName],
		toRule: allRules[toName],
		progress,
	}
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

function evolveWorld(
	world: WorldState,
	transition: TransitionSample,
	noiseSeed: number,
) {
	const currentGeneration = world.at(-1)

	if (!currentGeneration) return world

	const maxGenerations = world.length
	const nextGeneration = evolveGeneration(
		currentGeneration,
		transition,
		noiseSeed,
	)
	const generation = valueEq(currentGeneration, nextGeneration)
		? seedRandom(currentGeneration.length)
		: nextGeneration
	const nextWorld = world.concat([generation])

	if (nextWorld.length > maxGenerations) nextWorld.shift()

	return nextWorld
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

async function createRuntime(canvas: HTMLCanvasElement, hooks: RuntimeHooks) {
	const context = canvas.getContext("webgpu")

	if (!context) {
		hooks.onUnsupported("Unable to create a WebGPU context")
		return undefined
	}

	const worldDim = Math.min(
		Math.floor(window.innerWidth / CONFIG.worldCount),
		300,
	)
	const generationSize = Math.floor(worldDim / CONFIG.cellDim)

	canvas.width = worldDim * CONFIG.worldCount
	canvas.height = worldDim

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
	let step = 0
	let running = true
	let frameId = 0
	const phaseOffsets = Array.from({ length: CONFIG.worldCount }, (_, i) => {
		return i
	})
	const transitionBlendRatio =
		CONFIG.transitionBlendMs /
		Math.max(1, CONFIG.transitionHoldMs + CONFIG.transitionBlendMs)
	const transitionSegmentTicks = Math.max(
		1,
		Math.floor(generationSize / CONFIG.worldCount),
	)
	const transitionBlendTicks = Math.max(
		1,
		Math.floor(transitionSegmentTicks * transitionBlendRatio),
	)
	const transitionHoldTicks = Math.max(
		0,
		transitionSegmentTicks - transitionBlendTicks,
	)
	const ruleQueues = Array.from({ length: CONFIG.worldCount }, (_, i) => {
		return createAnimatedRuleQueue(
			RULE_SEQUENCE,
			phaseOffsets[i] ?? i,
			SCROLL_STOP_COUNT,
		)
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

			for (let i = 0; i < CONFIG.worldCount; i++) {
				const queue = ruleQueues[i]
				if (queue) {
					advanceAnimatedRuleQueue(queue, RULE_SEQUENCE, queueRatioDelta)

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

				const phaseOffset =
					(phaseOffsets[i] ?? 0) *
					Math.max(1, Math.floor(transitionSegmentTicks / CONFIG.worldCount))
				const transition = sampleTransition(
					RULE_SEQUENCE,
					currentStep + phaseOffset,
					{
						holdTicks: transitionHoldTicks,
						blendTicks: transitionBlendTicks,
					},
				)

				if (i === 0 && subStep % CONFIG.audioStepModulo === 0) {
					audioWorld = evolveWorld(
						audioWorld,
						transition,
						step + Math.imul(i + 1, 1_013_904_223),
					)
				}
			}

			renderer.step({
				ruleLookups,
				transitionRatios,
				ruleCounts,
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
