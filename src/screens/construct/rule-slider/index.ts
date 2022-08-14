import RuleThumbnail from '~/components/rule-thumbnail'
import { htmlToElement } from '~/lib/dom'

import { container, thumbnailContainer } from './rule-slider.module.css'

import type { Component, WorldStateEvolver } from '~/lib/types'

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
	<div class=${container} style="transform: translateY(${initialPosition}px)">
		<div class=${thumbnailContainer}></div>
	</div>`)

	el.querySelector(`.${thumbnailContainer}`)?.appendChild(thumbnail.el)

	let parentOffset = 0

	const handleMouseUp = () => {
		document.body.removeEventListener('mousemove', handleMouseMove)
		document.body.removeEventListener('mouseup', handleMouseUp)
		thumbnail.el.addEventListener('mousedown', handleMouseDown)
	}

	const handleMouseMove = (event: MouseEvent) => {
		let relPosition = event.clientY - parentOffset

		if (relPosition > maxPosition) relPosition = maxPosition
		if (relPosition < 0) relPosition = 0

		onPositionChange(relPosition)

		el.style.transform = `translateY(${relPosition}px)`
	}

	const handleMouseDown = () => {
		if (!allowMove) return

		parentOffset = el.parentElement?.getBoundingClientRect?.().top ?? 0

		document.body.removeEventListener('mousedown', handleMouseDown)
		document.body.addEventListener('mousemove', handleMouseMove)
		document.body.addEventListener('mouseup', handleMouseUp)
	}

	thumbnail.el.addEventListener('mousedown', handleMouseDown)

	return { el }
}

export default RuleSlider
