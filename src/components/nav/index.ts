import { htmlToElement } from '~/lib/dom'
import { github } from '~/style/icons'

import Button from '../button'
import { container } from './nav.module.css'

import type { createRouter } from '~/lib/router'
import type { Component } from '~/lib/types'

const Nav: Component<{
	navigate: ReturnType<typeof createRouter>['navigate']
}> = ({ navigate }) => {
	const el = htmlToElement(/* html */ `<div class=${container}></div>`)
	const h = Button({
		as: 'button',
		onClick: () => navigate('/'),
		content: 'h',
	})
	const c = Button({
		as: 'button',
		onClick: () => navigate('/construct'),
		content: 'c',
	})
	const githubLink = Button({
		as: 'link',
		href: 'https://github.com/kavsingh/cellular-automaton',
		content: github,
	})

	el.appendChild(h.el)
	el.appendChild(c.el)
	el.appendChild(githubLink.el)

	return { el }
}

export default Nav
