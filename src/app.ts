import Nav from "./components/nav"
import { createRouter } from "./lib/router"
import Construct from "./screens/construct"
import Scrolls from "./screens/scrolls"

import type { ComponentApi } from "./lib/types"

export default function app(rootEl: HTMLElement) {
	const screenContainer = document.createElement("div")
	let currentScreen: ComponentApi | undefined

	async function routeHandler(route: string) {
		if (currentScreen) await currentScreen.dispose?.()

		switch (route) {
			case "/":
				currentScreen = Scrolls({})
				break
			case "/construct":
				currentScreen = Construct({})
				break
			default:
				break
		}

		if (currentScreen) {
			screenContainer.innerHTML = ""
			screenContainer.appendChild(currentScreen.el)
		}
	}

	const router = createRouter(routeHandler)
	const nav = Nav({ navigate: router.navigate.bind(router) })

	screenContainer.classList.add("w-full", "h-full")

	rootEl.appendChild(screenContainer)
	rootEl.appendChild(nav.el)
}
