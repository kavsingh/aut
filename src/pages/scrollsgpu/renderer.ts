/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

import shader from "./shader.wgsl"

export function init(device: GPUDevice, context: GPUCanvasContext) {
	const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

	context.configure({ device, format: canvasFormat })

	// prettier-ignore
	const vertices = new Float32Array([
		//    X    Y
		   -0.8, -0.8, // Triangle 1 (bottom right)
		    0.8, -0.8,
		    0.8,  0.8,

		    0.8,  0.8, // Triangle 2 (top left)
		   -0.8,  0.8,
		   -0.8, -0.8,
	])

	const vertexBuffer = device.createBuffer({
		label: "Cell vertices",
		size: vertices.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	})

	device.queue.writeBuffer(vertexBuffer, 0, vertices)

	const vertexBufferLayout: GPUVertexBufferLayout = {
		arrayStride: vertices.BYTES_PER_ELEMENT * 2,
		attributes: [
			{
				format: "float32x2",
				offset: 0,
				shaderLocation: 0, // Position, see vertex shader
			},
		],
	}

	const cellShaderModule = device.createShaderModule({
		label: "Cell shader",
		code: shader,
	})

	const cellPipeline = device.createRenderPipeline({
		label: "Cell pipeline",
		layout: "auto",
		vertex: {
			module: cellShaderModule,
			entryPoint: "vertexMain",
			buffers: [vertexBufferLayout],
		},
		fragment: {
			module: cellShaderModule,
			entryPoint: "fragmentMain",
			targets: [{ format: canvasFormat }],
		},
	})

	const encoder = device.createCommandEncoder()
	const pass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: context.getCurrentTexture().createView(),
				loadOp: "clear",
				clearValue: { r: 255, g: 0, b: 0, a: 1 },
				storeOp: "store",
			},
		],
	})

	pass.setPipeline(cellPipeline)
	pass.setVertexBuffer(0, vertexBuffer)
	pass.draw(vertices.length / 6)
	pass.end()

	const commandBuffer = encoder.finish()

	device.queue.submit([commandBuffer])
	device.queue.submit([encoder.finish()])
}
