import { createSignal, onCleanup, onMount } from "solid-js"

import { Audio } from "~/audio"
import { Button } from "~/components/button"
import { SpeakerIcon } from "~/components/icons"
import { allRules } from "~/lib/rules"
import { valueEq } from "~/lib/util"
import { seedRandom, generateInitialWorld } from "~/lib/world"
import { createWgpuWorldRenderer } from "~/renderers/renderer-wgpu-worlds"

import type { EvolutionRule, WorldState } from "~/lib/types"

const WORLD_COUNT = 3
const CELL_DIM = 1
const UPDATE_INTERVAL_MS = 14
const TRANSITION_HOLD_MS = 1100
const TRANSITION_BLEND_MS = 500

type RuleName = keyof typeof allRules

interface TransitionSample {
	fromRule: EvolutionRule
	toRule: EvolutionRule
	progress: number
}

interface WgpuScrollsRuntime {
	toggleAudio: () => void
	stop: () => Promise<void>
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

function hash01(seed: number, index: number) {
	const x = Math.sin(seed * 12.9898 + (index + 1) * 78.233) * 43_758.5453

	return x - Math.floor(x)
}

function sampleTransition(
	sequence: RuleName[],
	elapsedMs: number,
	transition: { holdMs: number; blendMs: number },
): TransitionSample {
	const safeSequence =
		sequence.length > 0 ? sequence : (["rule3"] as RuleName[])
	const segmentMs = Math.max(1, transition.holdMs + transition.blendMs)
	const cycleMs = segmentMs * safeSequence.length
	const cycleElapsed = ((elapsedMs % cycleMs) + cycleMs) % cycleMs
	const segmentIndex = Math.floor(cycleElapsed / segmentMs)
	const segmentElapsed = cycleElapsed % segmentMs
	const nextIndex = (segmentIndex + 1) % safeSequence.length
	const fromName = safeSequence[segmentIndex] ?? "rule3"
	const toName = safeSequence[nextIndex] ?? "rule3"
	const progress =
		segmentElapsed <= transition.holdMs || transition.blendMs <= 0
			? 0
			: Math.min(1, (segmentElapsed - transition.holdMs) / transition.blendMs)

	return {
		fromRule: allRules[fromName],
		toRule: allRules[toName],
		progress,
	}
}

function evolveGeneration(
	current: number[],
	transition: TransitionSample,
	noiseSeed: number,
) {
	const next = Array.from<number>({ length: current.length }).fill(0)

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

		next[i] = hash01(noiseSeed, i) < transition.progress ? toValue : fromValue
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

async function createRuntime(
	canvas: HTMLCanvasElement,
	onUnsupported: (message: string) => void,
) {
	const context = canvas.getContext("webgpu")

	if (!context) {
		onUnsupported("Unable to create a WebGPU context")
		return undefined
	}

	const worldDim = Math.min(Math.floor(window.innerWidth / WORLD_COUNT), 300)
	const generationSize = Math.floor(worldDim / CELL_DIM)

	canvas.width = worldDim * WORLD_COUNT
	canvas.height = worldDim

	let renderer: ReturnType<typeof createWgpuWorldRenderer> | undefined =
		undefined

	try {
		const device = await getDevice()
		renderer = createWgpuWorldRenderer(device, context, {
			worldCount: WORLD_COUNT,
			generationSize,
		})
	} catch {
		onUnsupported("WebGPU is not available in this browser")
		return undefined
	}
	const worlds = Array.from({ length: WORLD_COUNT }, () =>
		generateInitialWorld(generationSize, generationSize),
	)
	const flatState = new Uint32Array(
		WORLD_COUNT * generationSize * generationSize,
	)
	const audio = new Audio()
	let step = 0
	let running = true
	let frameId = 0

	flattenWorlds(worlds, flatState)
	renderer.render(flatState)

	const updateInterval = setInterval(() => {
		if (!running) return

		const now = performance.now()
		const segmentMs = TRANSITION_HOLD_MS + TRANSITION_BLEND_MS

		for (let i = 0; i < worlds.length; i++) {
			const currentWorld = worlds[i]

			if (!currentWorld) continue

			const phaseOffset = Math.floor((segmentMs / WORLD_COUNT) * i)
			const transition = sampleTransition(RULE_SEQUENCE, now + phaseOffset, {
				holdMs: TRANSITION_HOLD_MS,
				blendMs: TRANSITION_BLEND_MS,
			})

			worlds[i] = evolveWorld(
				currentWorld,
				transition,
				step + Math.imul(i + 1, 1_013_904_223),
			)
		}

		step += 1
		audio.update(worlds[0] ?? [])
	}, UPDATE_INTERVAL_MS)

	const onFrame = () => {
		if (!running) return

		flattenWorlds(worlds, flatState)
		renderer.render(flatState)
		frameId = requestAnimationFrame(onFrame)
	}

	frameId = requestAnimationFrame(onFrame)

	const stop = async () => {
		running = false
		clearInterval(updateInterval)
		cancelAnimationFrame(frameId)
		await audio.dispose()
	}

	return {
		toggleAudio: () => {
			audio.toggle()
		},
		stop,
	} satisfies WgpuScrollsRuntime
}

export function WgpuScrolls() {
	let canvasEl: HTMLCanvasElement | undefined = undefined
	let runtime: WgpuScrollsRuntime | undefined = undefined
	const [unsupportedReason, setUnsupportedReason] = createSignal("")

	onMount(() => {
		if (!canvasEl) return

		void (async () => {
			runtime = await createRuntime(canvasEl, (message) => {
				setUnsupportedReason(message)
			})
		})()
	})

	onCleanup(async () => {
		await runtime?.stop()
	})

	return (
		<>
			<div class="grid place-items-center block-full inline-full">
				<canvas
					class="bg-white max-inline-full dark:bg-neutral-900"
					ref={(el) => void (canvasEl = el)}
				/>
				{unsupportedReason() ? (
					<p class="absolute inset-s-1/2 inset-bs-1/2 -translate-1/2 text-xs opacity-60">
						{unsupportedReason()}
					</p>
				) : null}
			</div>
			<div class="absolute inset-s-1/2 inset-be-[2em] flex -translate-x-1/2 gap-4">
				<Button
					onClick={() => {
						runtime?.toggleAudio()
					}}
				>
					<SpeakerIcon />
				</Button>
			</div>
		</>
	)
}
