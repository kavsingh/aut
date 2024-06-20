import { createEffect, createMemo, onMount } from "solid-js"

import { range } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import type { WorldStateEvolver } from "#lib/types"

export default function EvolverSnapshot(props: Props) {
	const size = createMemo(() => props.size ?? 40)
	let canvasRef: HTMLCanvasElement | null = null
	let render: ReturnType<typeof createRenderer> | undefined = undefined

	onMount(() => {
		if (!canvasRef) return

		const renderSize = size()

		render = createRenderer([canvasRef], {
			cellDim: 1,
			width: renderSize,
			height: renderSize,
			fillColor: getComputedStyle(canvasRef).color,
		})
	})

	createEffect(() => {
		if (!render) return

		const evolver = props.evolver
		const stateSize = size()

		render(
			range(stateSize).reduce(
				evolver,
				generateInitialWorld(stateSize, stateSize, seedRandom),
			),
		)
	})

	return <canvas class={props.class} ref={(el) => (canvasRef = el)} />
}

type Props = {
	evolver: WorldStateEvolver
	size?: number | undefined
	class?: string | undefined
}
