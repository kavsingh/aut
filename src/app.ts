import { screenContainer as screenContainerStyle } from './app.module.css'
import Nav from './components/nav'
import { createRouter } from './lib/router'
import Construct from './screens/construct'
import WorldScrolls from './screens/world-scrolls'

import type { ComponentApi } from './lib/types'

const app = (rootEl: HTMLElement) => {
	const screenContainer = document.createElement('div')
	let currentScreen: ComponentApi

	const routeHandler = async (route: string) => {
		if (currentScreen) await currentScreen.dispose?.()

		switch (route) {
			case '/':
				currentScreen = WorldScrolls({})
				break
			case '/construct':
				currentScreen = Construct({})
				break
			default:
				break
		}

		if (currentScreen) {
			screenContainer.innerHTML = ''
			screenContainer.appendChild(currentScreen.el)
		}
	}

	const router = createRouter(routeHandler)
	const nav = Nav({ navigate: router.navigate.bind(router) })

	screenContainer.classList.add(screenContainerStyle)

	rootEl.appendChild(screenContainer)
	rootEl.appendChild(nav.el)

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
}

export default app
