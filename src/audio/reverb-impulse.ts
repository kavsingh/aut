import { clamp } from "#lib/util"

import type { EffectNode } from "./types"

export default class ReverbImpulse implements EffectNode {
	#audioContext: AudioContext
	#convolver: ConvolverNode
	#wetGain: GainNode
	#dryGain: GainNode

	constructor(audioContext: AudioContext, impulseUrl: string) {
		this.#audioContext = audioContext

		this.#convolver = this.#audioContext.createConvolver()
		this.#wetGain = this.#audioContext.createGain()
		this.#dryGain = this.#audioContext.createGain()

		this.#convolver.connect(this.#wetGain)

		this.#wetGain.gain.setValueAtTime(0, this.#audioContext.currentTime)
		this.#dryGain.gain.setValueAtTime(1, this.#audioContext.currentTime)

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

	setWetDry(ratio: number, atTime?: number) {
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
