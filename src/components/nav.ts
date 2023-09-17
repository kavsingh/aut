import { construct, fullScreen, github, scrolls } from "~/components/icons"
import { htmlToElement } from "~/lib/dom"

import Button from "./button"

import type { createRouter } from "~/lib/router"
import type { Component } from "~/lib/types"

const Nav: Component<{
	navigate: ReturnType<typeof createRouter>["navigate"]
}> = ({ navigate }) => {
	const el = htmlToElement(
		/* html */ `<div class="fixed z-10 flex top-0 right-0 gap-1 pt-1 pe-1"></div>`,
	)
	const scrollsLink = Button({
		as: "button",
		onClick: () => {
			navigate("/")
		},
		content: scrolls,
	})
	const constructLink = Button({
		as: "button",
		onClick: () => {
			navigate("/construct")
		},
		content: construct,
	})
	const fullScreenButton = Button({
		as: "button",
		onClick: toggleFullscreen,
		content: fullScreen,
	})
	const githubLink = Button({
		as: "link",
		href: "https://github.com/kavsingh/cellular-automaton",
		content: github,
		class: "w-[1em]",
	})

	el.appendChild(scrollsLink.el)
	el.appendChild(constructLink.el)
	el.appendChild(fullScreenButton.el)
	el.appendChild(githubLink.el)

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
