import { RendererFactory } from '../types'

export const isWebGl2Context = (
	context: unknown,
): context is WebGL2RenderingContext =>
	context && context instanceof WebGL2RenderingContext

export const createRenderer: RendererFactory = (
	canvases,
	{
		width = 200,
		height = 200,
		// cellDim = 2,
		// fillColor = '#000000',
		// fillMode = 'active',
	},
) => {
	const contexts = canvases
		.map(canvas => canvas.getContext('webgl2'))
		.filter(isWebGl2Context)

	// const maxRows = Math.floor(height / cellDim)

	const clear = () =>
		contexts.forEach(context => {
			context.clearColor(0, 0, 0, 0)
			context.clear(context.COLOR_BUFFER_BIT)

			context.drawArrays
		})

	canvases.forEach(canvas => Object.assign(canvas, { width, height }))

	return _state => {
		clear()
	}
}
