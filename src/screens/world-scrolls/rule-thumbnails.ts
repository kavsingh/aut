import RuleThumbnail from '~/components/rule-thumbnail'
import { getCssValue } from '~/lib/css'
import { createEvolver } from '~/lib/evolver'

import type { EvolutionRule, WorldStateEvolver } from '~/lib/types'

export const addRuleThumbnails = (
	rules: EvolutionRule[],
	container: HTMLElement,
	onThumbnailClick: (evolver: WorldStateEvolver) => void,
) => {
	const fillColor = getCssValue('--color-line-600')

	rules.forEach((rule) => {
		const evolver = createEvolver(rule)
		const { el } = RuleThumbnail({ fillColor, evolver })

		container.appendChild(el)
		el.addEventListener('click', () => onThumbnailClick(evolver))
	})
}
