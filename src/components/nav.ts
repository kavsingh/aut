import { construct, fullScreen, github, scrolls } from "~/components/icons"
import { htmlToElement } from "~/lib/dom"

import Button from "./button"

import type { createRouter } from "~/lib/router"
import type { Component } from "~/lib/types"

const Nav: Component<{
	navigate: ReturnType<typeof createRouter>["navigate"]
}> = ({ navigate }) => {
	const el = htmlToElement(
		/* html */ `<div class="flex items-center gap-1"></div>`,
	)
	const scrollsLink = Button({
		as: "link",
		href: "/",
		content: scrolls,
	})
	const constructLink = Button({
		as: "link",
		href: "/construct",
		content: construct,
	})
	const fullScreenButton = Button({
		as: "button",
		label: "Fullscreen",
		onClick: toggleFullscreen,
		content: fullScreen,
	})
	const githubLink = Button({
		as: "link",
		href: "https://github.com/kavsingh/cellular-automaton",
		content: github,
		class: "w-5",
	})

	el.appendChild(scrollsLink.el)
	el.appendChild(constructLink.el)
	el.appendChild(fullScreenButton.el)
	el.appendChild(githubLink.el)

	el.addEventListener("click", (event) => {
		const url = findInternalUrl(el, event.target)

		if (!url) return

		event.preventDefault()
		event.stopPropagation()

		navigate(url)
	})

	return { el }
}

export default Nav

function toggleFullscreen() {
	if (document.fullscreenElement) {
		void document.exitFullscreen()
	} else {
		void document.documentElement.requestFullscreen()
	}
}

function findInternalUrl(
	container: HTMLElement,
	target: EventTarget | null,
): string | undefined {
	const targetUrl = getInternalUrl(target)

	if (targetUrl) return targetUrl
	if (!(target instanceof Element)) return undefined

	let root = target

	while (root.parentNode) {
		const parent = root.parentNode

		if (parent === container) return undefined

		const fromParent = getInternalUrl(parent)

		if (fromParent) return getInternalUrl(parent)
		else if (parent instanceof Element) root = parent
		else break
	}

	return undefined
}

function getInternalUrl(source: unknown) {
	if (!(source instanceof HTMLAnchorElement)) return undefined

	const href = source.getAttribute("href")

	return href?.startsWith("/") ? href : undefined
}
