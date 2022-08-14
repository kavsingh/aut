export const getCssValue = (cssVar: string, el?: HTMLElement) =>
	typeof window !== 'undefined'
		? getComputedStyle(el ?? document.body).getPropertyValue(cssVar) ?? '0'
		: '0'
