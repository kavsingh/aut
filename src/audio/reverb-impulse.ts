import { clamp } from "~/lib/util"

import type { ReverbNode } from "./types"

export default class ReverbImpulse implements ReverbNode {
	#audioContext: AudioContext
	#convolver: ConvolverNode
	#wetGain: GainNode
	#dryGain: GainNode
	#outGain: GainNode

	constructor(audioContext: AudioContext, impulseUrl: string) {
		this.#audioContext = audioContext

		this.#convolver = this.#audioContext.createConvolver()
		this.#wetGain = this.#audioContext.createGain()
		this.#dryGain = this.#audioContext.createGain()
		this.#outGain = this.#audioContext.createGain()

		this.#convolver.connect(this.#wetGain).connect(this.#outGain)
		this.#dryGain.connect(this.#outGain)

		this.#dryGain.gain.setValueAtTime(0, this.#audioContext.currentTime)
		this.#wetGain.gain.setValueAtTime(0, this.#audioContext.currentTime)

		void loadImpulse(this.#audioContext, impulseUrl).then((impulse) => {
			this.#convolver.buffer = impulse
		})
	}

	connectFrom(node: AudioNode) {
		node.connect(this.#convolver)
		node.connect(this.#dryGain)
	}

	connectTo(node: AudioNode) {
		this.#wetGain.connect(node)
		this.#dryGain.connect(node)
	}

	setWetDry(ratio: number, atTime?: number | undefined) {
		const clamped = clamp(0, 1, ratio)
		const time = atTime ?? this.#audioContext.currentTime

		this.#wetGain.gain.setValueAtTime(clamped, time)
		this.#dryGain.gain.setValueAtTime(1 - clamped, time)
	}
}

async function loadImpulse(audioContext: AudioContext, url: string) {
	const response = await fetch(url)
	const arrayBuffer = await response.arrayBuffer()

	return audioContext.decodeAudioData(arrayBuffer)
}
