/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

import shader from "./shader.wgsl"

const GRID_SIZE = 80

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

	const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE])
	const uniformBuffer = device.createBuffer({
		label: "Grid uniforms",
		size: uniformArray.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	})

	device.queue.writeBuffer(uniformBuffer, 0, uniformArray)

	const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE)
	const cellStateStorage = [
		device.createBuffer({
			label: "Cell state A",
			size: cellStateArray.byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		}),
		device.createBuffer({
			label: "Cell state B",
			size: cellStateArray.byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		}),
	] as const

	for (let i = 0; i < cellStateArray.length; i += 3) {
		cellStateArray[i] = 1
	}

	device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray)

	for (let i = 0; i < cellStateArray.length; i++) {
		cellStateArray[i] = i % 2
	}

	device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray)

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

	const bindGroups = [
		device.createBindGroup({
			label: "Cell renderer bind group A",
			layout: cellPipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: { buffer: cellStateStorage[0] } },
			],
		}),
		device.createBindGroup({
			label: "Cell renderer bind group B",
			layout: cellPipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: { buffer: cellStateStorage[1] } },
			],
		}),
	] as const

	let step = 0

	function update() {
		step++
		const encoder = device.createCommandEncoder()
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "clear",
					clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
					storeOp: "store",
				},
			],
		})

		pass.setPipeline(cellPipeline)
		pass.setVertexBuffer(0, vertexBuffer)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		pass.setBindGroup(0, bindGroups[step % 2]!)
		pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE)
		pass.end()

		device.queue.submit([encoder.finish()])
	}

	setInterval(update, 200)
}
