import { screenContainer as screenContainerStyle } from './app.module.css'
import Nav from './components/nav'
import { createRouter } from './lib/router'
import Construct from './screens/construct'
import Scrolls from './screens/scrolls'

import type { ComponentApi } from './lib/types'

const app = (rootEl: HTMLElement) => {
	const screenContainer = document.createElement('div')
	let currentScreen: ComponentApi

	const routeHandler = async (route: string) => {
		if (currentScreen) await currentScreen.dispose?.()

		switch (route) {
			case '/':
				currentScreen = Scrolls({})
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
}

export default app
