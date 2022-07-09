// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

export function initShaderProgram(
	gl: WebGL2RenderingContext,
	vsSource: string,
	fsSource: string,
) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!vertexShader) {
		throw new Error(`Could not load vertex shader ${vsSource}`)
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!fragmentShader) {
		throw new Error(`Could not load fragment shader ${fsSource}`)
	}

	const shaderProgram = gl.createProgram()

	if (!shaderProgram) throw new Error("Could not create shader program")

	gl.attachShader(shaderProgram, vertexShader)
	gl.attachShader(shaderProgram, fragmentShader)
	gl.linkProgram(shaderProgram)

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		throw new Error(
			`Could not initialize shader program: ${
				gl.getProgramInfoLog(shaderProgram) ?? "unknown"
			}`,
		)
	}

	return shaderProgram
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type)

	if (!shader) throw new Error(`Could not create shader with type ${type}`)

	// Send the source to the shader object

	gl.shaderSource(shader, source)

	// Compile the shader program

	gl.compileShader(shader)

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const shaderLog = gl.getShaderInfoLog(shader)

		gl.deleteShader(shader)

		throw new Error(`Could not compile shaders: ${shaderLog ?? "unknown"}`)
	}

	return shader
}
