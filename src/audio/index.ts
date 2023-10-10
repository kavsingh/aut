import { processWorld } from "./process-world"
import ReverbImpulse from "./reverb-impulse"
import starImpulse from "./star.wav"

import type { ReverbNode } from "./types"
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
	#reverbA: ReverbNode
	#reverbB: ReverbNode
	#mix: GainNode
	#compressor: DynamicsCompressorNode
	#oscillatorsStarted = false

	constructor() {
		this.#audioContext = new AudioContext()

		void this.#audioContext.suspend()

		this.#reverbA = new ReverbImpulse(this.#audioContext, starImpulse)
		this.#reverbB = new ReverbImpulse(this.#audioContext, starImpulse)

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
		this.#lfoGain.connect(this.#lowGain.gain)

		this.#mix.connect(this.#compressor).connect(this.#audioContext.destination)

		this.#lfo.type = "triangle"
		this.#lowOsc.type = "sine"
		this.#midOsc.type = "triangle"
		this.#highOsc.type = "triangle"

		this.#reverbA.setWetDry(0.2, this.#audioContext.currentTime)
		this.#reverbB.setWetDry(0.8, this.#audioContext.currentTime)
		this.#lfo.frequency.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#lowOsc.frequency.setValueAtTime(60, this.#audioContext.currentTime)
		this.#midOsc.frequency.setValueAtTime(120, this.#audioContext.currentTime)
		this.#highOsc.frequency.setValueAtTime(320, this.#audioContext.currentTime)
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

		this.#lowGain.gain.exponentialRampToValueAtTime(inactiveRatio * 0.3, time)
		this.#highGain.gain.exponentialRampToValueAtTime(
			activeRatio ** 2 * 0.1,
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
