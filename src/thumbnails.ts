import { range, seedRandom } from './util'
import { createCanvasRenderer } from './renderer'
import { createEvolver } from './evolver'
import { EvolutionRule } from './types'

const createRuleThumbnail = (thumbnailDim: number) => (rule: EvolutionRule) => {
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
	thumbnailDim = 40,
) => {
	const thumbnails = rules.map(createRuleThumbnail(thumbnailDim))

	thumbnails.forEach(({ element }) => void container.appendChild(element))

	return thumbnails
}
