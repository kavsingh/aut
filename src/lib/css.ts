import type { CssThemeProp } from '~/style/__generated__/constants'

export const getThemeValue = (prop: `${CssThemeProp}`, el?: HTMLElement) =>
	getCssValue(prop, el)

const getCssValue = (cssVar: string, el?: HTMLElement) =>
	typeof window !== 'undefined'
		? getComputedStyle(el ?? document.body).getPropertyValue(cssVar)
		: ''
