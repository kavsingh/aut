import Nav from "./components/nav"
import { createRouter } from "./lib/router"
import Construct from "./screens/construct"
import Scrolls from "./screens/scrolls"

import type { ComponentApi } from "./lib/types"

export default function app(rootEl: HTMLElement) {
	rootEl.innerHTML = /* html */ `
		<div
			data-el="nav-container"
			class="fixed z-10 w-full flex justify-end pt-8 px-8"
		></div>
		<div data-el="screen-container" class="h-full w-full"></div>
	`

	const navContainer = rootEl.querySelector("[data-el='nav-container']")
	const screenContainer = rootEl.querySelector("[data-el='screen-container']")

	if (!(navContainer && screenContainer)) throw new Error("Missing dom")

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

		if (currentScreen && screenContainer) {
			screenContainer.innerHTML = ""
			screenContainer.appendChild(currentScreen.el)
		}
	}

	const router = createRouter(routeHandler)
	const nav = Nav({ navigate: router.navigate.bind(router) })

	navContainer.appendChild(nav.el)
}
