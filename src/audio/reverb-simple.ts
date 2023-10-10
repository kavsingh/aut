import { clamp } from "~/lib/util"

import type { EffectNode } from "./types"

// ganked from https://github.com/web-audio-components/simple-reverb/blob/master/index.js

export default class ReverbSimple implements EffectNode {
	#audioContext: AudioContext
	#convolver: ConvolverNode
	#wet: GainNode
	#dry: GainNode
	#seconds: number
	#decay: number
	#reverse: boolean

	constructor(
		audioContext: AudioContext,
		options?: ReverbSimpleOptions | undefined,
	) {
		this.#audioContext = audioContext
		this.#seconds = options?.seconds ?? 3
		this.#decay = options?.decay ?? 2
		this.#reverse = options?.reverse ?? false

		this.#convolver = this.#audioContext.createConvolver()
		this.#wet = this.#audioContext.createGain()
		this.#dry = this.#audioContext.createGain()

		this.#convolver.connect(this.#wet)
		this.setWetDry(options?.wetDry ?? 0, this.#audioContext.currentTime)
		this.#buildImpulse()
	}

	get seconds() {
		return this.#seconds
	}

	set seconds(val: number) {
		this.#seconds = val
		this.#buildImpulse()
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	get decay() {
		return this.#decay
	}

	set decay(val: number) {
		this.#decay = val
		this.#buildImpulse()
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	get reverse() {
		return this.#reverse
	}

	set reverse(val: boolean) {
		this.#reverse = val
		this.#buildImpulse()
	}

	connectFrom(node: AudioNode) {
		node.connect(this.#convolver)
		node.connect(this.#dry)
	}

	connectTo(node: AudioNode) {
		this.#wet.connect(node)
		this.#dry.connect(node)
	}

	setWetDry(ratio: number, atTime?: number | undefined) {
		const clamped = clamp(0, 1, ratio)
		const time = atTime ?? this.#audioContext.currentTime

		this.#wet.gain.setValueAtTime(clamped, time)
		this.#dry.gain.setValueAtTime(1 - clamped, time)
	}

	#buildImpulse() {
		const rate = this.#audioContext.sampleRate
		const length = rate * this.#seconds
		const impulse = this.#audioContext.createBuffer(2, length, rate)
		const impulseL = impulse.getChannelData(0)
		const impulseR = impulse.getChannelData(1)

		for (let i = 0; i < length; i++) {
			const n = this.#reverse ? length - i : i
			const factor = (1 - n / length) ** this.#decay

			impulseL[i] = (Math.random() * 2 - 1) * factor
			impulseR[i] = (Math.random() * 2 - 1) * factor
		}

		this.#convolver.buffer = impulse
	}
}

export type ReverbSimpleOptions = {
	wetDry?: number | undefined
	seconds?: number | undefined
	decay?: number | undefined
	reverse?: boolean | undefined
}
