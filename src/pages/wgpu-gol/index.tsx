import { onMount } from "solid-js"

import { init } from "./renderer"

const DIM = 500

async function getDevice() {
	const adapter = await navigator.gpu.requestAdapter()

	if (!adapter) throw new Error("no adapter")

	return adapter.requestDevice()
}

export function WgpuGol() {
	let canvasEl: HTMLCanvasElement | undefined = undefined

	onMount(() => {
		const context = canvasEl?.getContext("webgpu")

		if (!context) return

		// oxlint-disable-next-line promise/prefer-await-to-then
		void getDevice().then((device) => {
			init(device, context, DIM)
		})
	})

	return (
		<div class="grid place-items-center block-full inline-full">
			<canvas width={DIM} height={DIM} ref={(el) => void (canvasEl = el)} />
		</div>
	)
}
