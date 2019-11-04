import { range, seedRandom } from './util'
import { createCanvasRenderer } from './renderer'
import { createEvolver } from './evolver'
import { EvolutionRule } from './types'

const createRuleThumbnail = (rule: EvolutionRule) => {
	const thumbnailDim = 40
	const ruleCanvas = document.createElement('canvas')
	const ruleRenderer = createCanvasRenderer([ruleCanvas], {
		cellDim: 1,
		width: thumbnailDim,
		height: thumbnailDim,
	})
	const evolver = createEvolver(rule)
	const state = range(thumbnailDim).reduce(acc => evolver(acc), [
		seedRandom(thumbnailDim),
	])

	ruleRenderer(state)

	return { evolver, element: ruleCanvas }
}

export const addRuleThumbnails = (
	rules: EvolutionRule[],
	container: HTMLElement,
) => {
	const thumbnails = rules.map(createRuleThumbnail)

	thumbnails.forEach(({ element }) => container.appendChild(element))

	return thumbnails
}
