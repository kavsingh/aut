import { container } from './nav.module.css'

import type { createRouter } from '~/lib/router'
import type { Component } from '~/lib/types'

const Nav: Component<{
	navigate: ReturnType<typeof createRouter>['navigate']
}> = ({ navigate }) => {
	const el = document.createElement('div')

	el.innerHTML = /*html*/ `
		<div class=${container}>
			<div data-navigate="">h</div>
			<div data-navigate="construct">c</div>
		</div>
	`

	Array.from(el.querySelectorAll('[data-navigate]')).forEach((navEl) =>
		navEl.addEventListener('click', (event) => {
			const { target } = event

			if (!(target instanceof HTMLElement)) return

			const to = target.getAttribute('data-navigate')

			navigate(to || '/')
		}),
	)

	return { el }
}

export default Nav
