import type { CssThemeProp } from "~/style/__generated__/constants"

export function getThemeValue(prop: `${CssThemeProp}`, el?: HTMLElement) {
	return getCssValue(prop, el)
}

function getCssValue(cssVar: string, el?: HTMLElement) {
	return getComputedStyle(el ?? globalThis.document.body).getPropertyValue(
		cssVar,
	)
}
