import { mat4 } from "gl-matrix"

import { is2dContext } from "../renderer-canvas2d"

import { initShaderProgram } from "./shader-program"
import worldFs from "./world.frag"
import worldVs from "./world.vert"

import type { WorldState } from "#lib/types"
import type { RendererFactory } from "#renderers/types"

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

	const texture = drawingContext.createTexture()

	if (!texture) throw new Error("Could not create texture")

	const shaderProgram = initShaderProgram(drawingContext, worldVs, worldFs)
	const programInfo = getProgramInfo(shaderProgram, drawingContext)
	const buffers = initBuffers(drawingContext)

	drawingContext.bindTexture(drawingContext.TEXTURE_2D, texture)
	drawingContext.texImage2D(
		drawingContext.TEXTURE_2D,
		0,
		drawingContext.RGBA,
		1,
		1,
		0,
		drawingContext.RGBA,
		drawingContext.UNSIGNED_BYTE,
		new Uint8Array([0, 0, 255, 255]),
	)

	return function draw(world) {
		drawScene(drawingContext, programInfo, buffers, texture, world)

		targetContexts.forEach((context) => {
			context.drawImage(drawingCanvas, 0, 0)
		})
	}
}

function getProgramInfo(
	program: WebGLProgram,
	gl: WebGL2RenderingContext,
): ProgramInfo {
	return {
		program,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
			textureCoord: gl.getAttribLocation(program, "aTextureCoord"),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
			modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
			resolution: gl.getUniformLocation(program, "uResolution"),
			uSampler: gl.getUniformLocation(program, "uSampler"),
		},
	}
}

function initBuffers(gl: WebGL2RenderingContext): Buffers {
	// prettier-ignore
	const positions = [
		1.0, 1.0,
		-1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
	]

	// prettier-ignore
	const textureCoords = [
		1.0, 1.0,
		-1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
	]

	// Create a buffer for the square's positions.
	const positionBuffer = gl.createBuffer()

	// Create a buffer for texture coords.
	const textureCoordBuffer = gl.createBuffer()

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

	// same for texture
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(textureCoords),
		gl.STATIC_DRAW,
	)

	return {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
	}
}

function drawScene(
	gl: WebGL2RenderingContext,
	programInfo: ReturnType<typeof getProgramInfo>,
	buffers: ReturnType<typeof initBuffers>,
	texture: WebGLTexture,
	_world: WorldState,
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

	// tell webgl how to pull out the texture coordinates from buffer
	{
		const num = 2 // every coordinate composed of 2 values
		const type = gl.FLOAT // the data in the buffer is 32-bit float
		const normalize = false // don't normalize
		const stride = 0 // how many bytes to get from one set to the next
		const offset = 0 // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			num,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord)
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

	// Tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0)

	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture)

	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0)

	const offset = 0
	const vertexCount = 4

	gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
}

function isWebGl2Context(context: unknown): context is WebGL2RenderingContext {
	return !!context && context instanceof WebGL2RenderingContext
}

type ProgramInfo = {
	program: WebGLProgram
	attribLocations: {
		vertexPosition: number
		textureCoord: number
	}
	uniformLocations: {
		projectionMatrix: WebGLUniformLocation | null
		modelViewMatrix: WebGLUniformLocation | null
		resolution: WebGLUniformLocation | null
		uSampler: WebGLUniformLocation | null
	}
}

type Buffers = {
	position: WebGLBuffer | null
	textureCoord: WebGLBuffer | null
}
