import { onMount } from "solid-js"

import { init } from "./renderer"

async function getDevice() {
	const adapter = await navigator.gpu.requestAdapter()

	if (!adapter) throw new Error("no adapter")

	return adapter.requestDevice()
}

export function Scrollsgpu() {
	let canvasEl: HTMLCanvasElement | undefined = undefined

	onMount(() => {
		const context = canvasEl?.getContext("webgpu")

		if (!context) return

		// oxlint-disable-next-line promise/prefer-await-to-then
		void getDevice().then((device) => {
			init(device, context)
		})
	})

	return (
		<div class="grid place-items-center block-full inline-full">
			<canvas width="400" height="400" ref={(el) => void (canvasEl = el)} />
		</div>
	)
}
