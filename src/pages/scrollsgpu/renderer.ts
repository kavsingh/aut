// oxlint-disable no-inline-comments

import typegpu, { d } from "typegpu"

import shader from "./shader.wgsl"
import simulation from "./simulation.wgsl"

const WORKGROUP_SIZE = 8 // sqrt 64

export function init(
	device: GPUDevice,
	context: GPUCanvasContext,
	gridSize: number,
) {
	const root = typegpu.initFromDevice({ device })
	const gpu = root.device
	const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

	context.configure({ device: gpu, format: canvasFormat })

	// oxfmt-ignore
	const vertices = new Float32Array([
		//    X    Y
		   -0.8, -0.8, // Triangle 1 (bottom right)
		    0.8, -0.8,
		    0.8,  0.8,

		    0.8,  0.8, // Triangle 2 (top left)
		   -0.8,  0.8,
		   -0.8, -0.8,
	])

	const vertexBuffer = root
		.createBuffer(d.arrayOf(d.vec2f, vertices.length / 2))
		.$usage("vertex")
		.$name("Cell vertices")

	vertexBuffer.write(vertices.buffer)

	const uniformBuffer = root
		.createBuffer(d.vec2f, d.vec2f(gridSize, gridSize))
		.$usage("uniform")
		.$name("Grid uniforms")

	const cellStateArray = new Uint32Array(gridSize * gridSize)
	const cellStateSchema = d.arrayOf(d.u32, gridSize * gridSize)
	const cellStateStorage = [
		root.createBuffer(cellStateSchema).$usage("storage").$name("Cell state A"),
		root.createBuffer(cellStateSchema).$usage("storage").$name("Cell state B"),
	] as const

	for (let i = 0; i < gridSize; ++i) {
		cellStateArray[i] = Math.random() > 0.6 ? 1 : 0
	}

	cellStateStorage[0].write(cellStateArray.buffer)

	for (let i = 0; i < cellStateArray.length; i++) {
		cellStateArray[i] = 0
	}

	cellStateStorage[1].write(cellStateArray.buffer)

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

	const cellShaderModule = gpu.createShaderModule({
		label: "Cell shader",
		code: shader,
	})

	const simulationShaderModule = gpu.createShaderModule({
		label: "Game of life simulation shader",
		code: simulation,
	})

	const bindGroupLayout = typegpu
		.bindGroupLayout({
			grid: {
				uniform: d.vec2f,
				visibility: ["vertex", "fragment", "compute"],
			},
			cellStateIn: {
				storage: cellStateSchema,
				access: "readonly",
				visibility: ["vertex", "compute"],
			},
			cellStateOut: {
				storage: cellStateSchema,
				access: "mutable",
				visibility: ["compute"],
			},
		})
		.$idx(0)
		.$name("Cell bind group layout")

	const bindGroups = [
		root.createBindGroup(bindGroupLayout, {
			grid: uniformBuffer,
			cellStateIn: cellStateStorage[0],
			cellStateOut: cellStateStorage[1],
		}),
		root.createBindGroup(bindGroupLayout, {
			grid: uniformBuffer,
			cellStateIn: cellStateStorage[1],
			cellStateOut: cellStateStorage[0],
		}),
	] as const

	const cellPipelineLayout = gpu.createPipelineLayout({
		label: "Cell pipeline layout",
		bindGroupLayouts: [root.unwrap(bindGroupLayout)],
	})

	const renderPipeline = gpu.createRenderPipeline({
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

	const simulationPipeline = gpu.createComputePipeline({
		label: "Simulation pipeline",
		layout: cellPipelineLayout,
		compute: {
			module: simulationShaderModule,
			entryPoint: "computeMain",
		},
	})

	let step = 0

	function getBindGroup(index: number) {
		return bindGroups[index % 2 === 0 ? 0 : 1]
	}

	function update() {
		const encoder = gpu.createCommandEncoder()
		const computePass = encoder.beginComputePass()
		const workgroupCount = Math.ceil(gridSize / WORKGROUP_SIZE)
		const activeBindGroup = getBindGroup(step)

		computePass.setPipeline(simulationPipeline)
		computePass.setBindGroup(0, root.unwrap(activeBindGroup))
		// https://codelabs.developers.google.com/your-first-webgpu-app#7
		computePass.dispatchWorkgroups(workgroupCount, workgroupCount)
		computePass.end()

		step += 1

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "clear",
					clearValue: { r: 0, g: 0, b: 0, a: 0 },
					storeOp: "store",
				},
			],
		})

		renderPass.setPipeline(renderPipeline)
		renderPass.setVertexBuffer(0, root.unwrap(vertexBuffer))
		renderPass.setBindGroup(0, root.unwrap(getBindGroup(step)))
		renderPass.draw(vertices.length / 2, gridSize * gridSize)
		renderPass.end()

		gpu.queue.submit([encoder.finish()])
	}

	setInterval(update, 16)
}
