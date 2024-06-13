import { onMount } from "solid-js"

import { range } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import type { WorldStateEvolver } from "#lib/types"

export default function EvolverSnapshot(props: Props) {
	let canvasRef: HTMLCanvasElement | null = null

	onMount(() => {
		if (!canvasRef) return

		const size = props.size ?? 40
		const evolver = props.evolver
		const state = range(size).reduce(
			(acc) => evolver(acc),
			generateInitialWorld(size, size, seedRandom),
		)

		const ruleRenderer = createRenderer([canvasRef], {
			cellDim: 1,
			width: size,
			height: size,
			fillColor: getComputedStyle(canvasRef).color,
		})

		ruleRenderer(state)
	})

	return <canvas class={props.class} ref={(el) => (canvasRef = el)} />
}

type Props = {
	evolver: WorldStateEvolver
	size?: number | undefined
	class?: string | undefined
}
