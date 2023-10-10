import { processWorld } from "./process-world"
import ReverbSimple from "./reverb-simple"

import type { EffectNode } from "./types"
import type { WorldState } from "~/lib/types"

export default class Audio {
	#audioContext: AudioContext
	#lfo: OscillatorNode
	#lowOsc: OscillatorNode
	#midOsc: OscillatorNode
	#highOsc: OscillatorNode
	#lfoGain: GainNode
	#lowGain: GainNode
	#midGain: GainNode
	#highGain: GainNode
	#reverbA: EffectNode
	#reverbB: EffectNode
	#mix: GainNode
	#compressor: DynamicsCompressorNode
	#oscillatorsStarted = false

	#lowBaseFreq = 60
	#midBaseFreq = 120
	#highBaseFreq = 240

	constructor() {
		this.#audioContext = new AudioContext()

		void this.#audioContext.suspend()

		this.#reverbA = new ReverbSimple(this.#audioContext)
		this.#reverbB = new ReverbSimple(this.#audioContext, {
			seconds: 10,
			reverse: true,
		})

		this.#lfo = this.#audioContext.createOscillator()
		this.#lowOsc = this.#audioContext.createOscillator()
		this.#midOsc = this.#audioContext.createOscillator()
		this.#highOsc = this.#audioContext.createOscillator()
		this.#lfoGain = this.#audioContext.createGain()
		this.#lowGain = this.#audioContext.createGain()
		this.#midGain = this.#audioContext.createGain()
		this.#highGain = this.#audioContext.createGain()
		this.#mix = this.#audioContext.createGain()
		this.#compressor = this.#audioContext.createDynamicsCompressor()

		this.#lowOsc.connect(this.#lowGain)
		this.#midOsc.connect(this.#midGain)
		this.#highOsc.connect(this.#highGain)

		this.#reverbA.connectFrom(this.#lowGain)
		this.#reverbA.connectFrom(this.#midGain)
		this.#reverbB.connectFrom(this.#highGain)

		this.#reverbA.connectTo(this.#mix)
		this.#reverbB.connectTo(this.#mix)

		this.#lfo.connect(this.#lfoGain)
		this.#lfoGain.connect(this.#highGain.gain)
		// this.#lfoGain.connect(this.#midGain.gain)
		this.#lfoGain.connect(this.#lowGain.gain)

		this.#mix.connect(this.#compressor).connect(this.#audioContext.destination)

		this.#lfo.type = "triangle"
		this.#lowOsc.type = "sine"
		this.#midOsc.type = "sawtooth"
		this.#highOsc.type = "sawtooth"

		this.#lowOsc.frequency.value = this.#lowBaseFreq
		this.#midOsc.frequency.value = this.#midBaseFreq
		this.#highOsc.frequency.value = this.#highBaseFreq

		this.#reverbA.setWetDry(0.2, this.#audioContext.currentTime)
		this.#reverbB.setWetDry(0.8, this.#audioContext.currentTime)
		this.#lfo.frequency.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#midGain.gain.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#lfoGain.gain.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#compressor.threshold.setValueAtTime(
			-40,
			this.#audioContext.currentTime,
		)
		this.#compressor.ratio.setValueAtTime(1.2, this.#audioContext.currentTime)
		this.#mix.gain.setValueAtTime(0.001, this.#audioContext.currentTime)
	}

	isRunning() {
		return this.#audioContext.state === "running"
	}

	async start() {
		if (this.isRunning()) return

		await this.#audioContext.resume()

		if (!this.#oscillatorsStarted) {
			this.#lfo.start()
			this.#lowOsc.start()
			this.#midOsc.start()
			this.#highOsc.start()
			this.#oscillatorsStarted = true
		}

		this.#mix.gain.exponentialRampToValueAtTime(
			1.0,
			this.#audioContext.currentTime + 2,
		)
	}

	async stop() {
		if (!this.isRunning()) return

		this.#mix.gain.setValueAtTime(0.001, this.#audioContext.currentTime)
		await this.#audioContext.suspend()
	}

	toggle() {
		if (this.isRunning()) void this.stop()
		else void this.start()
	}

	update(world: WorldState) {
		const time = this.#audioContext.currentTime + 0.06
		const { inactiveRatio, activeRatio, movement } = processWorld(world)

		this.#lowGain.gain.exponentialRampToValueAtTime(inactiveRatio * 0.4, time)
		this.#highGain.gain.exponentialRampToValueAtTime(
			activeRatio ** 2 * 0.06,
			time,
		)

		this.#highOsc.frequency.linearRampToValueAtTime(
			this.#highBaseFreq + (0.5 - activeRatio * 2) * 12,
			time,
		)

		this.#lfo.frequency.linearRampToValueAtTime(movement ** 4 * 40, time)
	}

	async dispose() {
		await this.stop()
		this.#mix.disconnect()

		return this.#audioContext.close()
	}
}
