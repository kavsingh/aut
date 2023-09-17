import RuleThumbnail from "~/components/rule-thumbnail"
import { htmlToElement } from "~/lib/dom"

import type { Component, WorldStateEvolver } from "~/lib/types"

const RuleSlider: Component<{
	evolver: WorldStateEvolver
	initialPosition: number
	maxPosition: number
	allowMove?: boolean
	onPositionChange: (position: number) => void
}> = ({
	evolver,
	initialPosition,
	maxPosition,
	onPositionChange,
	allowMove = true,
}) => {
	const thumbnail = RuleThumbnail({ evolver, size: 40 })
	const el = htmlToElement(/* html */ `
	<div
		class="absolute start-0 end-[-16px] top-0 h-[1px] bg-neutral-400 dark:bg-neutral-500 cursor-ns-resize first:cursor-default"
		style="transform: translateY(${initialPosition}px)"
	>
		<div
			data-el="thumbnail-container"
			class="absolute overflow-hidden bg-white dark:bg-neutral-950 rounded-full scale-50 opacity-40 w-[40px] h-[40px] end-[-40px] top-[-20px] hover:opacity-100 hover:scale-100 transition-all"
		></div>
	</div>`)

	el.querySelector("[data-el='thumbnail-container']")?.appendChild(thumbnail.el)

	let parentOffset = 0

	function handleMouseUp() {
		document.body.removeEventListener("mousemove", handleMouseMove)
		document.body.removeEventListener("mouseup", handleMouseUp)
		thumbnail.el.addEventListener("mousedown", handleMouseDown)
	}

	function handleMouseMove(event: MouseEvent) {
		let relPosition = event.clientY - parentOffset

		if (relPosition > maxPosition) relPosition = maxPosition
		if (relPosition < 0) relPosition = 0

		onPositionChange(relPosition)

		el.style.transform = `translateY(${relPosition}px)`
	}

	function handleMouseDown() {
		if (!allowMove) return

		parentOffset = el.parentElement?.getBoundingClientRect().top ?? 0

		document.body.removeEventListener("mousedown", handleMouseDown)
		document.body.addEventListener("mousemove", handleMouseMove)
		document.body.addEventListener("mouseup", handleMouseUp)
	}

	thumbnail.el.addEventListener("mousedown", handleMouseDown)

	return { el }
}

export default RuleSlider
