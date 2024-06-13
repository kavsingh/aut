import { For, createEffect, onCleanup } from "solid-js"

import Audio from "#audio"
import Button from "#components/button"
import { CameraIcon, SpeakerIcon } from "#components/icons"
import RuleThumbnail from "#components/rule-thumbnail"
import { createEvolver } from "#lib/evolver"
import * as rules from "#lib/rules"
import { createWorldsForType, startWorldAnimations } from "#lib/scrolls/worlds"
import { generateInitialWorld } from "#lib/world"

import type { State } from "#lib/scrolls/types"

export default function Scrolls() {
	const worldCount = 3
	const cellDim = 2
	const worldDim = Math.min(Math.floor(window.innerWidth / worldCount), 300)
	const generationSize = Math.floor(worldDim / cellDim)
	const audio = new Audio()
	const scrollsState: State = {
		cellDim,
		worldDim,
		rules: Object.values(rules),
		evolver: undefined,
		world: generateInitialWorld(generationSize, generationSize),
	}
	let worldsContainer: HTMLDivElement | null = null
	let worldsApi: ReturnType<typeof createWorldsForType> | undefined = undefined

	const stopWorldAnimations = startWorldAnimations(scrollsState, {
		worldCount,
		renderWorld: (...args) => worldsApi?.render(...args),
		audio,
	})

	createEffect(() => {
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
		<div class="flex size-full items-center justify-center">
			<div class="group relative z-[2] mt-[60px]">
				<div
					class="flex cursor-pointer items-center justify-center [&>*:nth-child(2n-1)]:rotate-180"
					ref={(el) => (worldsContainer = el)}
				/>
				<div class="pointer-events-none flex h-[60px] translate-y-[-20%] cursor-pointer items-center justify-center opacity-0 transition-all group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
					<For each={scrollsState.rules}>
						{(rule, idx) => {
							const evolver = createEvolver(rule)

							return (
								<button
									aria-label={`Rule ${idx() + 1}`}
									onClick={() => (scrollsState.evolver = evolver)}
								>
									<RuleThumbnail evolver={evolver} />
								</button>
							)
						}}
					</For>
				</div>
			</div>
			<div class="absolute bottom-[2em] start-1/2 flex -translate-x-1/2 gap-4">
				<Button>
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
