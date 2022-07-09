import * as rules from './rules'
import { saveSvgSnapshot } from './snapshot-to-svg'
import { addRuleThumbnails } from './thumbnails'
import { generateInitialWorld, getCssValue } from './util'
import { createWorldsForType, startWorldAnimations } from './worlds'

import type { State } from './types'

const app = ({
	worldCount,
	worldsContainer,
	thumbnailsContainer,
	snapshotButton,
}: {
	worldCount: number
	worldsContainer: HTMLElement
	thumbnailsContainer: HTMLElement
	snapshotButton: HTMLElement
}) => {
	const cellDim = 2
	const worldDim = Math.min(Math.floor(window.innerWidth / worldCount), 300)
	const generationSize = Math.floor(worldDim / cellDim)
	const state: State = {
		cellDim,
		worldDim,
		rules: Object.values(rules),
		evolver: undefined,
		world: generateInitialWorld(generationSize, generationSize),
	}

	const thumbnails = addRuleThumbnails(state.rules, thumbnailsContainer)
	const { render: renderWorld } = createWorldsForType(
		'canvas2d',
		worldsContainer,
		{
			count: worldCount,
			rendererOptions: {
				cellDim,
				width: worldDim,
				height: worldDim,
				fillColor: getCssValue(worldsContainer, '--color-line-600'),
			},
		},
	)

	thumbnails.forEach(({ element, evolver }) => {
		element.addEventListener('click', () => void (state.evolver = evolver))
	})

	worldsContainer.addEventListener(
		'click',
		() => void (state.evolver = undefined),
	)

	snapshotButton.addEventListener(
		'click',
		() => void saveSvgSnapshot('snapshot.svg', state),
	)

	document.addEventListener(
		'dblclick',
		(event) => {
			event.preventDefault()

			if (!document.fullscreenElement) {
				void document.documentElement.requestFullscreen()
			} else if (document.exitFullscreen) {
				void document.exitFullscreen()
			}
		},
		false,
	)

	startWorldAnimations(state, { worldCount, renderWorld })
}

const worldsContainer = document.querySelector<HTMLElement>('.worlds')
const thumbnailsContainer = document.querySelector<HTMLElement>('.thumbnails')
const snapshotButton = document.querySelector<HTMLElement>('.snapshot-button')

if (!(worldsContainer && thumbnailsContainer && snapshotButton)) {
	throw new Error(
		'missing dom, expected .worlds, .thumbnails, .snapshot-button',
	)
}

app({ worldsContainer, thumbnailsContainer, snapshotButton, worldCount: 3 })
