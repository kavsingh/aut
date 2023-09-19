import { htmlToElement } from "./dom"

let srcElement: HTMLElement | undefined = undefined

export function getComputedFillColor() {
	if (!srcElement) {
		srcElement = htmlToElement(
			/* html */ `<span class="hidden text-black dark:text-white"></span>`,
		)

		document.body.appendChild(srcElement)
	}

	return getComputedStyle(srcElement).color
}
