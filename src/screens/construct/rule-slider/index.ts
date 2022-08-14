import RuleThumbnail from '~/components/rule-thumbnail'
import { htmlToFragment } from '~/lib/dom'

import { container, thumbnailContainer } from './rule-slider.module.css'

import type { Component, WorldStateEvolver } from '~/lib/types'

const RuleSlider: Component<{
	evolver: WorldStateEvolver
	initialPosition: number
	maxPosition: number
}> = ({ evolver, initialPosition }) => {
	const thumbnail = RuleThumbnail({ evolver, size: 40 })
	const el = htmlToFragment(/* html */ `
	<div class=${container} style="transform: translateY(${initialPosition}px)">
		<div class=${thumbnailContainer}></div>
	</div>`)

	el.querySelector(`.${thumbnailContainer}`)?.appendChild(thumbnail.el)

	return { el }
}

export default RuleSlider
