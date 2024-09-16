/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

import shader from "./shader.wgsl"
import simulation from "./simulation.wgsl"

const WORKGROUP_SIZE = 8 // sqrt 64

export function init(
	device: GPUDevice,
	context: GPUCanvasContext,
	gridSize: number,
) {
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

	const uniformArray = new Float32Array([gridSize, gridSize])
	const uniformBuffer = device.createBuffer({
		label: "Grid uniforms",
		size: uniformArray.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	})

	device.queue.writeBuffer(uniformBuffer, 0, uniformArray)

	const cellStateArray = new Uint32Array(gridSize * gridSize)
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

	for (let i = 0; i < cellStateArray.length; ++i) {
		cellStateArray[i] = Math.random() > 0.6 ? 1 : 0
	}

	device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray)

	for (let i = 0; i < cellStateArray.length; i++) {
		cellStateArray[i] = 0
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

	const simulationShaderModule = device.createShaderModule({
		label: "Game of life simulation shader",
		code: simulation,
	})

	const bindGroupLayout = device.createBindGroupLayout({
		label: "Cell bind group layout",
		entries: [
			{
				binding: 0,
				visibility:
					GPUShaderStage.VERTEX |
					GPUShaderStage.FRAGMENT |
					GPUShaderStage.COMPUTE,
				buffer: { type: "uniform" },
			},
			{
				binding: 1,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
				buffer: { type: "read-only-storage" },
			},
			{
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: { type: "storage" },
			},
		],
	})

	const bindGroups = [
		device.createBindGroup({
			label: "Cell renderer bind group A",
			layout: bindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: { buffer: cellStateStorage[0] } },
				{ binding: 2, resource: { buffer: cellStateStorage[1] } },
			],
		}),
		device.createBindGroup({
			label: "Cell renderer bind group B",
			layout: bindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: uniformBuffer } },
				{ binding: 1, resource: { buffer: cellStateStorage[1] } },
				{ binding: 2, resource: { buffer: cellStateStorage[0] } },
			],
		}),
	] as const

	const cellPipelineLayout = device.createPipelineLayout({
		label: "Cell pipeline layout",
		bindGroupLayouts: [bindGroupLayout],
	})

	const renderPipeline = device.createRenderPipeline({
		label: "Render pipeline",
		layout: cellPipelineLayout,
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

	const simulationPipeline = device.createComputePipeline({
		label: "Simulation pipeline",
		layout: cellPipelineLayout,
		compute: {
			module: simulationShaderModule,
			entryPoint: "computeMain",
		},
	})

	let step = 0

	function update() {
		const encoder = device.createCommandEncoder()
		const computePass = encoder.beginComputePass()
		const workgroupCount = Math.ceil(gridSize / WORKGROUP_SIZE)

		computePass.setPipeline(simulationPipeline)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		computePass.setBindGroup(0, bindGroups[step % 2]!)
		// https://codelabs.developers.google.com/your-first-webgpu-app#7
		computePass.dispatchWorkgroups(workgroupCount, workgroupCount)
		computePass.end()

		step++

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "clear",
					clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
					storeOp: "store",
				},
			],
		})

		renderPass.setPipeline(renderPipeline)
		renderPass.setVertexBuffer(0, vertexBuffer)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		renderPass.setBindGroup(0, bindGroups[step % 2]!)
		renderPass.draw(vertices.length / 2, gridSize * gridSize)
		renderPass.end()

		device.queue.submit([encoder.finish()])
	}

	setInterval(update, 16)
}
