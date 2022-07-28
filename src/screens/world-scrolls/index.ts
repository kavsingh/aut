import { createAudio } from '~/audio'
import * as rules from '~/lib/rules'
import { generateInitialWorld, getCssValue } from '~/util'
import { htmlToFragment } from '~/util/dom'

import { saveSvgSnapshot } from './lib/snapshot-to-svg'
import { createWorldsForType, startWorldAnimations } from './lib/worlds'
import { addRuleThumbnails } from './rule-thumbnails'
import { html } from './world-scrolls.html'
import {
	worlds,
	thumbnailsContainer as thumbnailsContainerClass,
	snapshotButton as snapshotButtonClass,
	audioButton as audioButtonClass,
} from './worlds-scrolls.module.css'

import type { State } from './lib/types'
import type { Component } from '~/lib/types'

const WorldScrolls: Component = () => {
	const worldCount = 3
	const el = htmlToFragment(html)
	const worldsContainer = el.querySelector<HTMLElement>(`.${worlds}`)
	const audioButton = el.querySelector<HTMLElement>(`.${audioButtonClass}`)
	const snapshotButton = el.querySelector<HTMLElement>(
		`.${snapshotButtonClass}`,
	)
	const thumbnailsContainer = el.querySelector<HTMLElement>(
		`.${thumbnailsContainerClass}`,
	)

	if (
		!(worldsContainer && thumbnailsContainer && snapshotButton && audioButton)
	) {
		throw new Error(
			'missing dom, expected .worlds, .thumbnails, .snapshot-button, .audio-button',
		)
	}

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

	const audio = createAudio()
	const { render: renderWorld } = createWorldsForType(
		'canvas2d',
		worldsContainer,
		{
			count: worldCount,
			rendererOptions: {
				cellDim,
				width: worldDim,
				height: worldDim,
				fillColor: getCssValue('--color-line-600'),
			},
		},
	)

	worldsContainer.addEventListener(
		'click',
		() => void (state.evolver = undefined),
	)

	snapshotButton.addEventListener(
		'click',
		() => void saveSvgSnapshot('snapshot.svg', state),
	)

	audioButton.addEventListener('click', audio.toggle)

	document.addEventListener(
		'dblclick',
		(event) => {
			if (event.target !== document.body) return

			event.preventDefault()

			if (!document.fullscreenElement) {
				void document.documentElement.requestFullscreen()
			} else if (document.exitFullscreen) {
				void document.exitFullscreen()
			}
		},
		false,
	)

	addRuleThumbnails(
		state.rules,
		thumbnailsContainer,
		(evolver) => void (state.evolver = evolver),
	)

	startWorldAnimations(state, { worldCount, renderWorld, audio })

	return { el }
}

export default WorldScrolls
