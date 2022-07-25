import { createAudio } from '~/audio'
import { htmlToFragment } from '~/lib/dom'
import * as rules from '~/lib/rules'
import { saveSvgSnapshot } from '~/lib/snapshot-to-svg'
import { createWorldsForType, startWorldAnimations } from '~/lib/worlds'
import { generateInitialWorld, getCssValue } from '~/util'

import { addRuleThumbnails } from './thumbnails'
import { html } from './world-scrolls.html'
import {
	worlds,
	thumbnailsContainer as thumbnailsContainerClass,
	snapshotButton as snapshotButtonClass,
	audioButton as audioButtonClass,
} from './worlds-scrolls.module.css'

import type { Component, State } from '~/lib/types'

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
				fillColor: getCssValue('--color-line-600'),
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

	startWorldAnimations(state, { worldCount, renderWorld, audio })

	return { el }
}

export default WorldScrolls
