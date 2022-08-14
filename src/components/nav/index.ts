import { htmlToElement } from '~/lib/dom'
import { construct, fullScreen, github, scrolls } from '~/style/icons'

import Button from '../button'
import { container } from './nav.module.css'

import type { createRouter } from '~/lib/router'
import type { Component } from '~/lib/types'

const Nav: Component<{
	navigate: ReturnType<typeof createRouter>['navigate']
}> = ({ navigate }) => {
	const el = htmlToElement(/* html */ `<div class=${container}></div>`)
	const scrollsLink = Button({
		as: 'button',
		onClick: () => navigate('/'),
		content: scrolls,
	})
	const constructLink = Button({
		as: 'button',
		onClick: () => navigate('/construct'),
		content: construct,
	})
	const fullScreenButton = Button({
		as: 'button',
		onClick: toggleFullscreen,
		content: fullScreen,
	})
	const githubLink = Button({
		as: 'link',
		href: 'https://github.com/kavsingh/cellular-automaton',
		content: github,
	})

	el.appendChild(scrollsLink.el)
	el.appendChild(constructLink.el)
	el.appendChild(fullScreenButton.el)
	el.appendChild(githubLink.el)

	return { el }
}

export default Nav

const toggleFullscreen = () => {
	if (!document.fullscreenElement) {
		void document.documentElement.requestFullscreen()
	} else if (document.exitFullscreen) {
		void document.exitFullscreen()
	}
}
