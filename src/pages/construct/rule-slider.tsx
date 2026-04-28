import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"

import { Button } from "~/components/button"
import { EvolverSnapshot } from "~/components/evolver-snapshot"
import { ChevronRightIcon } from "~/components/icons"
import { tv } from "~/lib/style"

import { ALL_EVOLVERS } from "./lib"

interface Props {
	evolverName: string
	initialPosition: number
	maxPosition: number
	onPositionChange: (position: number) => void
	onEvolverSelect: (evolverName: string) => void
	movable: boolean
}

const ruleSliderVariants = tv({
	base: "absolute inset-s-full inset-e-[-16px] inset-bs-0 bg-neutral-400 block-px dark:bg-neutral-500",
	variants: {
		movable: {
			true: "cursor-ns-resize",
			false: "cursor-default",
		},
	},
})

export function RuleSlider(props: Props) {
	const [showSelector, setShowSelector] = createSignal(false)
	const evolver = createMemo(() => ALL_EVOLVERS[props.evolverName])
	let parentOffset = 0
	let containerEl: HTMLDivElement | null = null

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

	function startDrag() {
		setShowSelector(false)

		if (!(props.movable && containerEl)) return

		parentOffset = containerEl.parentElement?.getBoundingClientRect().top ?? 0

		document.body.addEventListener("pointermove", drag)
		document.body.addEventListener("pointerup", endDrag)
	}

	onCleanup(endDrag)

	return (
		<div
			class={ruleSliderVariants({ movable: props.movable })}
			style={{ transform: `translateY(${props.initialPosition}px)` }}
			ref={(el) => void (containerEl = el)}
		>
			<div class="absolute inset-e-[-8px]">
				<div
					class="absolute inset-bs-[-16px] scale-[66%] overflow-hidden rounded-full bg-white opacity-40 transition-all block-[32px] inline-[32px] hover:scale-100 hover:opacity-100 dark:bg-neutral-900"
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
							class="absolute inset-s-[36px] inset-bs-[-6px] block-3 inline-3"
							onClick={() => void setShowSelector(true)}
						>
							<ChevronRightIcon />
						</Button>
					}
				>
					<div class="absolute inset-s-[50px] inset-bs-[-20px] grid grid-cols-3 opacity-100 inline-[102px]">
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
