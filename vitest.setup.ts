// adapted from https://github.com/hustcc/jest-canvas-mock/issues/88
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// vitest.setup.ts
import { afterAll, vi } from 'vitest'
// @ts-expect-error: Global type missing
global.jest = vi
// @ts-expect-error: No types available
// eslint-disable-next-line import/order
import getCanvasWindow from 'jest-canvas-mock/lib/window'

const apis = [
	'Path2D',
	'CanvasGradient',
	'CanvasPattern',
	'CanvasRenderingContext2D',
	'DOMMatrix',
	'ImageData',
	'TextMetrics',
	'ImageBitmap',
	'createImageBitmap',
] as const

const canvasWindow = getCanvasWindow({ document: window.document })

apis.forEach((api) => {
	global[api] = canvasWindow[api]
	global.window[api] = canvasWindow[api]
})

afterAll(() => {
	// @ts-expect-error: type
	delete global.jest
	// @ts-expect-error: type
	delete global.window.jest
})
