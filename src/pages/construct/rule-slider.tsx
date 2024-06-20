import { For, Show, createMemo, onCleanup } from "solid-js"
import { twMerge } from "tailwind-merge"

import EvolverSnapshot from "#components/evolver-snapshot"

import { ALL_EVOLVERS } from "./lib"

export default function RuleSlider(props: Props) {
	const evolver = createMemo(() => ALL_EVOLVERS[props.evolverName])
	let parentOffset = 0
	let containerEl: HTMLDivElement | null = null

	function startDrag() {
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
			class={twMerge(
				"absolute end-[-16px] start-full top-0 h-px bg-neutral-400 dark:bg-neutral-500",
				props.movable ? "cursor-ns-resize" : "cursor-default",
			)}
			style={{ transform: `translateY(${props.initialPosition}px)` }}
			ref={(el) => (containerEl = el)}
		>
			<div class="absolute end-[-10px]">
				<div
					class="absolute top-[-20px] size-[40px] scale-50 overflow-hidden rounded-full bg-white opacity-40 transition-all hover:scale-100 hover:opacity-100 dark:bg-neutral-900"
					onPointerDown={startDrag}
				>
					<Show when={evolver()}>
						{(currentEvolver) => <EvolverSnapshot evolver={currentEvolver()} />}
					</Show>
				</div>
				<div class="absolute start-[50px] top-[-20px] grid w-[102px] grid-cols-3 opacity-100">
					<For each={Object.entries(ALL_EVOLVERS)}>
						{([name, namedEvolver]) => (
							<button
								class="bg-white transition-all dark:bg-neutral-900"
								onClick={() => {
									props.onEvolverSelect(name)
								}}
							>
								<EvolverSnapshot evolver={namedEvolver} size={34} />
							</button>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}

type Props = {
	evolverName: string
	initialPosition: number
	maxPosition: number
	onPositionChange: (position: number) => void
	onEvolverSelect: (evolverName: string) => void
	movable: boolean
}
