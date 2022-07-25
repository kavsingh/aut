export const getCssValue = (cssVar: string) =>
	typeof window !== 'undefined'
		? getComputedStyle(document.body).getPropertyValue(cssVar) ?? '#000'
		: '#000'
