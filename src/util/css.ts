import { curry } from '@kavsingh/curry-pipe'

export const getCssValue = curry((el: HTMLElement, cssVar: string) =>
	typeof window !== 'undefined'
		? getComputedStyle(el).getPropertyValue(cssVar) ?? '#000'
		: '#000',
)
