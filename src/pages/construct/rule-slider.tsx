import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"
import { tv } from "tailwind-variants"

import Button from "#components/button"
import EvolverSnapshot from "#components/evolver-snapshot"
import { ChevronRightIcon } from "#components/icons"

import { ALL_EVOLVERS } from "./lib"

export default function RuleSlider(props: Props) {
	const [showSelector, setShowSelector] = createSignal(false)
	const evolver = createMemo(() => ALL_EVOLVERS[props.evolverName])
	let parentOffset = 0
	let containerEl: HTMLDivElement | null = null

	function startDrag() {
		setShowSelector(false)

		if (!(props.movable && containerEl)) return

		parentOffset = containerEl.parentElement?.getBoundingClientRect().top ?? 0

		document.body.addEventListener("pointermove", drag)
		document.body.addEventListener("pointerup", endDrag)
	}

	function drag(event: MouseEvent) {
		if (!containerEl) return

		let relPosition = event.clientY - parentOffset

		if (relPosition > props.maxPosition) relPosition = props.maxPosition
		if (relPosition < 0) relPosition = 0

		props.onPositionChange(relPosition)

		containerEl.style.transform = `translateY(${relPosition}px)`
	}

	function endDrag() {
		document.body.removeEventListener("pointermove", drag)
		document.body.removeEventListener("pointerup", endDrag)
	}

	onCleanup(endDrag)

	return (
		<div
			class={ruleSliderVariants({ movable: props.movable })}
			style={{ transform: `translateY(${props.initialPosition}px)` }}
			ref={(el) => (containerEl = el)}
		>
			<div class="absolute end-[-8px]">
				<div
					class="absolute top-[-16px] size-[32px] scale-[66%] overflow-hidden rounded-full bg-white opacity-40 transition-all hover:scale-100 hover:opacity-100 dark:bg-neutral-900"
					onPointerDown={startDrag}
				>
					<Show when={evolver()}>
						{(currentEvolver) => (
							<EvolverSnapshot evolver={currentEvolver()} size={32} />
						)}
					</Show>
				</div>
				<Show
					when={showSelector()}
					fallback={
						<Button
							class="absolute start-[36px] top-[-6px] size-3"
							onClick={[setShowSelector, true]}
						>
							<ChevronRightIcon />
						</Button>
					}
				>
					<div class="absolute start-[50px] top-[-20px] grid w-[102px] grid-cols-3 opacity-100">
						<For each={Object.entries(ALL_EVOLVERS)}>
							{([name, namedEvolver]) => (
								<button
									class="bg-white transition-all dark:bg-neutral-900"
									onClick={() => {
										setShowSelector(false)
										props.onEvolverSelect(name)
									}}
								>
									<EvolverSnapshot evolver={namedEvolver} size={34} />
								</button>
							)}
						</For>
					</div>
				</Show>
			</div>
		</div>
	)
}

const ruleSliderVariants = tv({
	base: "absolute start-full end-[-16px] top-0 h-px bg-neutral-400 dark:bg-neutral-500",
	variants: {
		movable: {
			true: "cursor-ns-resize",
			false: "cursor-default",
		},
	},
})

interface Props {
	evolverName: string
	initialPosition: number
	maxPosition: number
	onPositionChange: (position: number) => void
	onEvolverSelect: (evolverName: string) => void
	movable: boolean
}
