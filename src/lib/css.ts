import type { CssThemeProp } from '~/style/__generated__/constants'

export const getThemeValue = (prop: `${CssThemeProp}`, el?: HTMLElement) =>
	getCssValue(prop, el)

const getCssValue = (cssVar: string, el?: HTMLElement) =>
	globalThis.document?.body
		? getComputedStyle(el ?? globalThis.document.body).getPropertyValue(cssVar)
		: ''
