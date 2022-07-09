import { mat4 } from "gl-matrix"

import { is2dContext } from "../renderer-canvas2d"

import { initShaderProgram } from "./shader-program"
import worldFs from "./world.frag"
import worldVs from "./world.vert"

import type { RendererFactory } from "../types"

export const createRenderer: RendererFactory<HTMLCanvasElement> = (
	canvases,
	{
		width = 200,
		height = 200,
		// cellDim = 2,
		// fillColor = '#000000',
		// fillMode = 'active',
	},
) => {
	const [drawingCanvas, ...targetCanvases] = canvases

	if (!drawingCanvas) throw new Error("No main canvas provided")

	const drawingContext = drawingCanvas.getContext("webgl2")

	if (!isWebGl2Context(drawingContext)) {
		throw new Error("No main webgl context available")
	}

	const targetContexts = targetCanvases
		.map((canvas) => canvas.getContext("2d"))
		.filter(is2dContext)

	canvases.forEach((canvas) => Object.assign(canvas, { width, height }))

	const shaderProgram = initShaderProgram(drawingContext, worldVs, worldFs)
	const programInfo: ProgramInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: drawingContext.getAttribLocation(
				shaderProgram,
				"aVertexPosition",
			),
		},
		uniformLocations: {
			projectionMatrix: drawingContext.getUniformLocation(
				shaderProgram,
				"uProjectionMatrix",
			),
			modelViewMatrix: drawingContext.getUniformLocation(
				shaderProgram,
				"uModelViewMatrix",
			),
			resolution: drawingContext.getUniformLocation(
				shaderProgram,
				"uResolution",
			),
		},
	}
	const buffers = initBuffers(drawingContext)

	const draw = () => {
		drawScene(drawingContext, programInfo, buffers)

		targetContexts.forEach((context) => {
			context.drawImage(drawingCanvas, 0, 0)
		})
	}

	return (_state) => {
		draw()
	}
}

function initBuffers(gl: WebGL2RenderingContext): Buffers {
	// Create a buffer for the square's positions.

	const positionBuffer = gl.createBuffer()

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

	// Now create an array of positions for the square.

	const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

	return {
		position: positionBuffer,
	}
}

function drawScene(
	gl: WebGL2RenderingContext,
	programInfo: ProgramInfo,
	buffers: Buffers,
) {
	gl.clearColor(0.0, 0.0, 0.0, 0.0) // Clear to black, fully opaque
	gl.clearDepth(1.0) // Clear everything
	gl.enable(gl.DEPTH_TEST) // Enable depth testing
	gl.depthFunc(gl.LEQUAL) // Near things obscure far things

	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = (45 * Math.PI) / 180 // in radians
	const aspect = gl.canvas.width / gl.canvas.height
	const zNear = 0.1
	const zFar = 100.0
	const projectionMatrix = mat4.create()

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	// mat4.ortho(projectionMatrix, 0.0, 1.0, 0.0, 1.0, zNear, zFar)
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create()

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	mat4.translate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to translate
		[-0.0, 0.0, -1.0],
	) // amount to translate

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	{
		const numComponents = 2 // pull out 2 values per iteration
		const type = gl.FLOAT // the data in the buffer is 32bit floats
		const normalize = false // don't normalize
		const stride = 0 // how many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0 // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
	}

	// Tell WebGL to use our program when drawing

	gl.useProgram(programInfo.program)

	// Set the shader uniforms

	gl.uniform3f(
		programInfo.uniformLocations.resolution,
		gl.canvas.width,
		gl.canvas.height,
		1.0,
	)

	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix,
	)
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix,
	)

	const offset = 0
	const vertexCount = 4
	gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
}

type ProgramInfo = {
	program: WebGLProgram
	attribLocations: {
		vertexPosition: number
	}
	uniformLocations: {
		projectionMatrix: WebGLUniformLocation | null
		modelViewMatrix: WebGLUniformLocation | null
		resolution: WebGLUniformLocation | null
	}
}

type Buffers = {
	position: WebGLBuffer | null
}

const isWebGl2Context = (context: unknown): context is WebGL2RenderingContext =>
	!!context && context instanceof WebGL2RenderingContext
