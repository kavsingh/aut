import { onCleanup } from "solid-js"

import EvolverSnapshot from "#components/evolver-snapshot"

import type { WorldStateEvolver } from "#lib/types"

export default function RuleSlider(props: Props) {
	let parentOffset = 0
	let containerEl: HTMLDivElement | null = null

	function handlePointerUp() {
		document.body.removeEventListener("pointermove", handlePointerMove)
		document.body.removeEventListener("pointerup", handlePointerUp)
	}

	function handlePointerMove(event: MouseEvent) {
		if (!containerEl) return

		let relPosition = event.clientY - parentOffset

		if (relPosition > props.maxPosition) relPosition = props.maxPosition
		if (relPosition < 0) relPosition = 0

		props.onPositionChange(relPosition)

		containerEl.style.transform = `translateY(${relPosition}px)`
	}

	function handlePointerDown() {
		if (!(props.allowMove && containerEl)) return

		parentOffset = containerEl.parentElement?.getBoundingClientRect().top ?? 0

		document.body.addEventListener("pointermove", handlePointerMove)
		document.body.addEventListener("pointerup", handlePointerUp)
	}

	onCleanup(() => {
		document.body.removeEventListener("pointermove", handlePointerMove)
		document.body.removeEventListener("pointerup", handlePointerUp)
	})

	return (
		<div
			class="absolute end-[-16px] start-0 top-0 h-px cursor-ns-resize bg-neutral-400 first:cursor-default dark:bg-neutral-500"
			style={{ transform: `translateY(${props.initialPosition}px)` }}
			ref={(el) => (containerEl = el)}
		>
			<div
				class="absolute end-[-40px] top-[-20px] size-[40px] scale-50 overflow-hidden rounded-full bg-white opacity-40 transition-all hover:scale-100 hover:opacity-100 dark:bg-neutral-900"
				onPointerDown={handlePointerDown}
			>
				<EvolverSnapshot evolver={props.evolver} />
			</div>
		</div>
	)
}

type Props = {
	evolver: WorldStateEvolver
	initialPosition: number
	maxPosition: number
	onPositionChange: (position: number) => void
	allowMove?: boolean
}
