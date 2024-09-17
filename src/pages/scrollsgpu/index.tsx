/// <reference types="@webgpu/types" />

import { onMount } from "solid-js"

import { init } from "./renderer"

const DIM = 500

export default function Scrollsgpu() {
	let canvasEl: HTMLCanvasElement | undefined

	onMount(() => {
		const context = canvasEl?.getContext("webgpu")

		if (!context) return

		void getDevice().then((device) => {
			init(device, context, DIM)
		})
	})

	return (
		<div class="grid size-full place-items-center">
			<canvas width={DIM} height={DIM} ref={(el) => (canvasEl = el)} />
		</div>
	)
}

async function getDevice() {
	const adapter = await navigator.gpu.requestAdapter()

	if (!adapter) return Promise.reject(new Error("no adapter"))

	return adapter.requestDevice()
}