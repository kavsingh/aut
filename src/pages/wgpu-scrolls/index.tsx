import { createSignal, onCleanup, onMount } from "solid-js"

import { Audio } from "~/audio"
import { Button } from "~/components/button"
import { SpeakerIcon } from "~/components/icons"

import { createRuntime } from "./runtime"
import { usePerfMonitor } from "./use-perf-monitor"

import type { WgpuScrollsRuntime } from "./runtime"

export function WgpuScrolls() {
	let canvasEl: HTMLCanvasElement | undefined = undefined
	let runtime: WgpuScrollsRuntime | undefined = undefined
	const [unsupportedReason, setUnsupportedReason] = createSignal("")
	const perfMonitor = usePerfMonitor(true)

	onMount(() => {
		if (!canvasEl) return
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
			runtime = await createRuntime(canvasEl, {
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
				<canvas
					class="bg-white max-inline-full dark:bg-neutral-900"
					ref={(el) => void (canvasEl = el)}
				/>
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
