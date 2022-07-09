import { createEvolver } from './evolver'
import { createRenderer } from './renderers/renderer-canvas2d'
import { generateInitialWorld, getCssValue, range, seedRandom } from './util'

import type { EvolutionRule } from './types'

const createRuleThumbnail =
	(thumbnailDim: number, fillColor: string) => (rule: EvolutionRule) => {
		const ruleCanvas = document.createElement('canvas')
		const ruleRenderer = createRenderer([ruleCanvas], {
			fillColor,
			cellDim: 1,
			width: thumbnailDim,
			height: thumbnailDim,
		})
		const evolver = createEvolver(rule)
		const state = range(thumbnailDim).reduce(
			(acc) => evolver(acc),
			generateInitialWorld(thumbnailDim, thumbnailDim, seedRandom),
		)

		ruleRenderer(state)

		return { evolver, element: ruleCanvas }
	}

export const addRuleThumbnails = (
	rules: EvolutionRule[],
	container: HTMLElement,
	thumbnailDim = 40,
) => {
	const thumbnails = rules.map(
		createRuleThumbnail(
			thumbnailDim,
			getCssValue(container, '--color-line-600'),
		),
	)

	thumbnails.forEach(({ element }) => void container.appendChild(element))

	return thumbnails
}
