import { loadImpulses } from "./impulses"
import { processWorld } from "./process-world"

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
	#reverbA: ConvolverNode
	#reverbB: ConvolverNode
	#reverbAGain: GainNode
	#reverbBGain: GainNode
	#dry: GainNode
	#out: GainNode
	#compressor: DynamicsCompressorNode
	#oscillatorsStarted = false

	constructor() {
		this.#audioContext = new AudioContext()

		void this.#audioContext.suspend()

		this.#lfo = this.#audioContext.createOscillator()
		this.#lowOsc = this.#audioContext.createOscillator()
		this.#midOsc = this.#audioContext.createOscillator()
		this.#highOsc = this.#audioContext.createOscillator()
		this.#lfoGain = this.#audioContext.createGain()
		this.#lowGain = this.#audioContext.createGain()
		this.#midGain = this.#audioContext.createGain()
		this.#highGain = this.#audioContext.createGain()
		this.#reverbA = this.#audioContext.createConvolver()
		this.#reverbB = this.#audioContext.createConvolver()
		this.#reverbAGain = this.#audioContext.createGain()
		this.#reverbBGain = this.#audioContext.createGain()
		this.#dry = this.#audioContext.createGain()
		this.#out = this.#audioContext.createGain()
		this.#compressor = this.#audioContext.createDynamicsCompressor()

		this.#lowOsc.connect(this.#lowGain)
		this.#midOsc.connect(this.#midGain)
		this.#highOsc.connect(this.#highGain)

		this.#lowGain.connect(this.#reverbA)
		this.#lowGain.connect(this.#dry)

		this.#midGain.connect(this.#reverbA)
		this.#midGain.connect(this.#dry)

		this.#highGain.connect(this.#reverbB)
		this.#highGain.connect(this.#dry)

		this.#reverbA.connect(this.#reverbAGain).connect(this.#out)
		this.#reverbB.connect(this.#reverbBGain).connect(this.#out)

		this.#lfo.connect(this.#lfoGain)
		this.#lfoGain.connect(this.#highGain.gain)
		this.#lfoGain.connect(this.#lowGain.gain)

		this.#dry.connect(this.#out)
		this.#out.connect(this.#compressor).connect(this.#audioContext.destination)

		this.#lfo.type = "triangle"
		this.#lowOsc.type = "sine"
		this.#midOsc.type = "triangle"
		this.#highOsc.type = "triangle"

		this.#lfo.frequency.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#lowOsc.frequency.setValueAtTime(60, this.#audioContext.currentTime)
		this.#midOsc.frequency.setValueAtTime(120, this.#audioContext.currentTime)
		this.#highOsc.frequency.setValueAtTime(320, this.#audioContext.currentTime)

		this.#midGain.gain.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#lfoGain.gain.setValueAtTime(0.01, this.#audioContext.currentTime)
		this.#reverbAGain.gain.setValueAtTime(0.2, this.#audioContext.currentTime)
		this.#reverbBGain.gain.setValueAtTime(0.5, this.#audioContext.currentTime)
		this.#dry.gain.setValueAtTime(0.3, this.#audioContext.currentTime)
		this.#compressor.threshold.setValueAtTime(
			-40,
			this.#audioContext.currentTime,
		)
		this.#compressor.ratio.setValueAtTime(1.2, this.#audioContext.currentTime)
		this.#out.gain.setValueAtTime(0.001, this.#audioContext.currentTime)

		void loadImpulses(this.#audioContext, ["star"]).then(([impulse]) => {
			if (impulse) this.#reverbA.buffer = this.#reverbB.buffer = impulse
		})
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

		this.#out.gain.exponentialRampToValueAtTime(
			1.0,
			this.#audioContext.currentTime + 2,
		)
	}

	async stop() {
		if (!this.isRunning()) return

		this.#out.gain.setValueAtTime(0.001, this.#audioContext.currentTime)
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
		this.#out.disconnect()

		return this.#audioContext.close()
	}
}
