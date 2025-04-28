import { createEffect, createMemo, onMount } from "solid-js"

import { range } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import type { WorldStateEvolver } from "#lib/types"

export default function EvolverSnapshot(props: Props) {
	const world = createMemo(() => {
		const evolver = props.evolver
		const size = props.size ?? 40

		return range(size).reduce(
			evolver,
			generateInitialWorld(size, size, seedRandom),
		)
	})

	let canvasRef: HTMLCanvasElement | null = null
	let render: ReturnType<typeof createRenderer> | undefined = undefined

	onMount(() => {
		if (!canvasRef) return

		const size = props.size ?? 40

		render = createRenderer([canvasRef], {
			cellDim: 1,
			width: size,
			height: size,
			fillColor: getComputedStyle(canvasRef).color,
		})
	})

	createEffect(() => {
		render?.(world())
	})

	return <canvas class={props.class} ref={(el) => (canvasRef = el)} />
}

interface Props {
	evolver: WorldStateEvolver
	size?: number | undefined
	class?: string | undefined
}
