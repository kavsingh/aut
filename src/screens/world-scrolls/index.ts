import { createAudio } from '~/audio'
import Button from '~/components/button'
import { getThemeValue } from '~/lib/css'
import { htmlToFragment } from '~/lib/dom'
import * as rules from '~/lib/rules'
import { generateInitialWorld } from '~/lib/world'
import { camera, speaker } from '~/style/icons'

import { saveSvgSnapshot } from './lib/snapshot-to-svg'
import { createWorldsForType, startWorldAnimations } from './lib/worlds'
import { addRuleThumbnails } from './rule-thumbnails'
import { html } from './world-scrolls.html'
import {
	worlds,
	thumbnailsContainer as thumbnailsContainerClass,
	buttons,
} from './worlds-scrolls.module.css'

import type { State } from './lib/types'
import type { Component } from '~/lib/types'

const WorldScrolls: Component = () => {
	const worldCount = 3
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
	const snapshotButton = Button({
		as: 'button',
		content: camera,
		onClick: () => void saveSvgSnapshot('snapshot.svg', state),
	})
	const audioButton = Button({
		as: 'button',
		content: speaker,
		onClick: audio.toggle.bind(audio),
	})

	const el = htmlToFragment(html)
	const worldsContainer = el.querySelector<HTMLElement>(`.${worlds}`)
	const thumbnailsContainer = el.querySelector<HTMLElement>(
		`.${thumbnailsContainerClass}`,
	)
	const buttonsContainer = el.querySelector<HTMLElement>(`.${buttons}`)

	if (!(worldsContainer && thumbnailsContainer && buttonsContainer)) {
		throw new Error('missing dom, expected worlds, thumbnails, buttons')
	}

	buttonsContainer.appendChild(snapshotButton.el)
	buttonsContainer.appendChild(audioButton.el)

	const { render: renderWorld } = createWorldsForType(
		'canvas2d',
		worldsContainer,
		{
			count: worldCount,
			rendererOptions: {
				cellDim,
				width: worldDim,
				height: worldDim,
				fillColor: getThemeValue('--color-line-600'),
			},
		},
	)

	worldsContainer.addEventListener(
		'click',
		() => void (state.evolver = undefined),
	)

	addRuleThumbnails(
		state.rules,
		thumbnailsContainer,
		(evolver) => void (state.evolver = evolver),
	)

	const stopWorldAnimations = startWorldAnimations(state, {
		worldCount,
		renderWorld,
		audio,
	})

	const dispose = async () => {
		stopWorldAnimations()
		await audio.dispose()
	}

	return { el, dispose }
}

export default WorldScrolls
