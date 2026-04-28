import { For, onCleanup, onMount } from "solid-js"

import { Audio } from "~/audio"
import { Button } from "~/components/button"
import { EvolverSnapshot } from "~/components/evolver-snapshot"
import { CameraIcon, SpeakerIcon } from "~/components/icons"
import { createEvolver } from "~/lib/evolver"
import { allRules as rules } from "~/lib/rules"
import { generateInitialWorld } from "~/lib/world"
import { saveSvgSnapshot } from "~/pages/scrolls/lib/snapshot-to-svg"

import { createWorldsForType, startWorldAnimations } from "./lib/worlds"

import type { State } from "~/pages/scrolls/lib/types"

export function Scrolls() {
	const worldCount = 3
	const cellDim = 2
	const worldDim = Math.min(Math.floor(window.innerWidth / worldCount), 300)
	const generationSize = Math.floor(worldDim / cellDim)
	const audio = new Audio()
	const worldState: State = {
		cellDim,
		worldDim,
		rules: Object.values(rules),
		evolver: undefined,
		world: generateInitialWorld(generationSize, generationSize),
	}
	let worldsContainer: HTMLDivElement | null = null
	let worldsApi: ReturnType<typeof createWorldsForType> | undefined = undefined

	const stopWorldAnimations = startWorldAnimations(worldState, {
		worldCount,
		renderWorld: (...args) => worldsApi?.render(...args),
		audio,
	})

	onMount(() => {
		if (!worldsContainer) return

		worldsApi = createWorldsForType("canvas2d", worldsContainer, {
			count: worldCount,
			rendererOptions: { cellDim, width: worldDim, height: worldDim },
		})
	})

	onCleanup(async () => {
		stopWorldAnimations()
		await audio.dispose()
	})

	return (
		<div class="flex items-center justify-center block-full inline-full">
			<div class="group relative z-2 mbs-[60px]">
				<div
					class="flex cursor-pointer items-center justify-center [&>*:nth-child(2n-1)]:rotate-180"
					ref={(el) => void (worldsContainer = el)}
					onClick={() => (worldState.evolver = undefined)}
				/>
				<div class="pointer-events-none flex translate-y-[-20%] cursor-pointer items-center justify-center opacity-0 transition-all block-[60px] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
					<For each={worldState.rules}>
						{(rule, idx) => {
							const evolver = createEvolver(rule)

							return (
								<button
									aria-label={`Rule ${idx() + 1}`}
									onClick={() => void (worldState.evolver = evolver)}
								>
									<EvolverSnapshot evolver={evolver} />
								</button>
							)
						}}
					</For>
				</div>
			</div>
			<div class="absolute inset-s-1/2 inset-be-[2em] flex -translate-x-1/2 gap-4">
				<Button
					onClick={() => {
						saveSvgSnapshot("snapshot.svg", worldState)
					}}
				>
					<CameraIcon />
				</Button>
				<Button
					onClick={() => {
						audio.toggle()
					}}
				>
					<SpeakerIcon />
				</Button>
			</div>
		</div>
	)
}
