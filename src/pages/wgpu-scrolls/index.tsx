import { For, createSignal, onCleanup, onMount } from "solid-js"

import { Audio } from "~/audio"
import { Button } from "~/components/button"
import { SpeakerIcon } from "~/components/icons"

import { createRuntime } from "./runtime"
import { usePerfMonitor } from "./use-perf-monitor"

import type { WgpuScrollsRuntime } from "./runtime"

export function WgpuScrolls() {
	const worldCount = 3
	const worldIndices = Array.from({ length: worldCount }, (_, idx) => idx)
	const canvasEls: (HTMLCanvasElement | undefined)[] = []
	let runtime: WgpuScrollsRuntime | undefined = undefined
	const [unsupportedReason, setUnsupportedReason] = createSignal("")
	const perfMonitor = usePerfMonitor()

	onMount(() => {
		const canvases = canvasEls.filter(
			(canvas): canvas is HTMLCanvasElement => !!canvas,
		)
		if (canvases.length === 0) return
		const audio = new Audio()

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() !== "p") return

			perfMonitor.toggleVisibility()
		}

		globalThis.addEventListener("keydown", onKeyDown)
		onCleanup(() => {
			globalThis.removeEventListener("keydown", onKeyDown)
		})

		void (async () => {
			runtime = await createRuntime(canvases, {
				onUnsupported: (message) => {
					setUnsupportedReason(message)
				},
				onRenderSample: perfMonitor.onRenderSample,
				onUpdateSample: perfMonitor.onUpdateSample,
				audio,
			})
		})()
	})

	onCleanup(async () => {
		await runtime?.stop()
	})

	return (
		<>
			<div class="grid place-items-center block-full inline-full">
				{perfMonitor.isVisible() ? (
					<div class="absolute inset-s-4 inset-bs-4 z-10 text-[10px] opacity-70">
						{`FPS ${perfMonitor.perf().fps} | UPS ${perfMonitor.perf().ups} | render ${perfMonitor.perf().renderMs}ms | update ${perfMonitor.perf().updateMs}ms | cells ${perfMonitor.perf().cellCount}`}
					</div>
				) : null}
				<div class="flex items-center justify-center [&>*:nth-child(2n-1)]:rotate-180">
					<For each={worldIndices}>
						{(index) => (
							<canvas
								class="max-inline-full"
								ref={(el) => {
									canvasEls[index] = el
								}}
							/>
						)}
					</For>
				</div>
				{unsupportedReason() ? (
					<p class="absolute inset-s-1/2 inset-bs-1/2 -translate-1/2 text-xs opacity-60">
						{unsupportedReason()}
					</p>
				) : null}
			</div>
			<div class="absolute inset-s-1/2 inset-be-[2em] flex -translate-x-1/2 gap-4">
				<Button
					onClick={() => {
						runtime?.toggleAudio()
					}}
				>
					<SpeakerIcon />
				</Button>
			</div>
		</>
	)
}
