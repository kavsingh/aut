import { createSignal } from "solid-js"

interface PerfSnapshot {
	fps: number
	ups: number
	renderMs: number
	updateMs: number
	cellCount: number
}

const PERF_WINDOW_MS = 500

export function usePerfMonitor(initialVisible = false) {
	const [isVisible, setIsVisible] = createSignal(initialVisible)
	const [perf, setPerf] = createSignal<PerfSnapshot>({
		fps: 0,
		ups: 0,
		renderMs: 0,
		updateMs: 0,
		cellCount: 0,
	})

	let windowStart = performance.now()
	let renderCount = 0
	let updateCount = 0
	let renderAccMs = 0
	let updateAccMs = 0
	let cellCount = 0

	function flushIfNeeded(now: number) {
		const elapsed = now - windowStart

		if (elapsed < PERF_WINDOW_MS) return

		setPerf({
			fps: Math.round((renderCount * 1000) / elapsed),
			ups: Math.round((updateCount * 1000) / elapsed),
			renderMs:
				renderCount > 0
					? Math.round((renderAccMs / renderCount) * 100) / 100
					: 0,
			updateMs:
				updateCount > 0
					? Math.round((updateAccMs / updateCount) * 100) / 100
					: 0,
			cellCount,
		})

		windowStart = now
		renderCount = 0
		updateCount = 0
		renderAccMs = 0
		updateAccMs = 0
	}

	function onRenderSample(sample: { renderMs: number; cellCount: number }) {
		renderCount += 1
		renderAccMs += sample.renderMs
		cellCount = sample.cellCount
		flushIfNeeded(performance.now())
	}

	function onUpdateSample(sample: { updateMs: number }) {
		updateCount += 1
		updateAccMs += sample.updateMs
		flushIfNeeded(performance.now())
	}

	function toggleVisibility() {
		setIsVisible((current) => !current)
	}

	return {
		perf,
		isVisible,
		onRenderSample,
		onUpdateSample,
		toggleVisibility,
	}
}

export type { PerfSnapshot }
