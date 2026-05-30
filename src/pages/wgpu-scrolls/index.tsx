import { createSignal, onCleanup, onMount } from "solid-js"

import { Audio } from "~/audio"
import { Button } from "~/components/button"
import { SpeakerIcon } from "~/components/icons"

import { createRuntime } from "./runtime"

import type { PerfSnapshot, WgpuScrollsRuntime } from "./runtime"

export function WgpuScrolls() {
	let canvasEl: HTMLCanvasElement | undefined = undefined
	let runtime: WgpuScrollsRuntime | undefined = undefined
	const [unsupportedReason, setUnsupportedReason] = createSignal("")
	const [showPerf, setShowPerf] = createSignal(true)
	const [perf, setPerf] = createSignal<PerfSnapshot>({
		fps: 0,
		ups: 0,
		renderMs: 0,
		updateMs: 0,
		cellCount: 0,
	})

	onMount(() => {
		if (!canvasEl) return
		const audio = new Audio()

		void (async () => {
			runtime = await createRuntime(canvasEl, {
				onUnsupported: (message) => {
					setUnsupportedReason(message)
				},
				onPerf: (snapshot) => {
					setPerf(snapshot)
				},
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
				{showPerf() ? (
					<div class="absolute inset-s-4 inset-bs-4 z-10 text-[10px] opacity-70">
						{`FPS ${perf().fps} | UPS ${perf().ups} | render ${perf().renderMs}ms | update ${perf().updateMs}ms | cells ${perf().cellCount}`}
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
						setShowPerf((current) => !current)
					}}
				>
					<span>{showPerf() ? "PERF ON" : "PERF OFF"}</span>
				</Button>
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
