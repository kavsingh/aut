import { loadImpulses } from './impulses'
import { processWorld } from './process-world'

import type { WorldState } from '~/lib/types'

export const createAudio = (): AudioApi => {
	const audioContext: AudioContext = new AudioContext()

	void audioContext.suspend()

	const lfo = audioContext.createOscillator()
	const lowOsc = audioContext.createOscillator()
	const midOsc = audioContext.createOscillator()
	const highOsc = audioContext.createOscillator()
	const lfoGain = audioContext.createGain()
	const lowGain = audioContext.createGain()
	const midGain = audioContext.createGain()
	const highGain = audioContext.createGain()
	const reverbA = audioContext.createConvolver()
	const reverbB = audioContext.createConvolver()
	const reverbAGain = audioContext.createGain()
	const reverbBGain = audioContext.createGain()
	const dry = audioContext.createGain()
	const out = audioContext.createGain()
	const compressor = audioContext.createDynamicsCompressor()
	let oscillatorsStarted = false

	lowOsc.connect(lowGain)
	midOsc.connect(midGain)
	highOsc.connect(highGain)

	lowGain.connect(reverbA)
	lowGain.connect(dry)

	midGain.connect(reverbA)
	midGain.connect(dry)

	highGain.connect(reverbB)
	highGain.connect(dry)

	reverbA.connect(reverbAGain).connect(out)
	reverbB.connect(reverbBGain).connect(out)

	lfo.connect(lfoGain)
	lfoGain.connect(highGain.gain)
	lfoGain.connect(lowGain.gain)

	dry.connect(out)
	out.connect(compressor).connect(audioContext.destination)

	lfo.type = 'triangle'
	lowOsc.type = 'sine'
	midOsc.type = 'triangle'
	highOsc.type = 'triangle'

	lfo.frequency.setValueAtTime(0.01, audioContext.currentTime)
	lowOsc.frequency.setValueAtTime(60, audioContext.currentTime)
	midOsc.frequency.setValueAtTime(120, audioContext.currentTime)
	highOsc.frequency.setValueAtTime(320, audioContext.currentTime)

	midGain.gain.setValueAtTime(0.01, audioContext.currentTime)
	lfoGain.gain.setValueAtTime(0.01, audioContext.currentTime)
	reverbAGain.gain.setValueAtTime(0.2, audioContext.currentTime)
	reverbBGain.gain.setValueAtTime(0.5, audioContext.currentTime)
	dry.gain.setValueAtTime(0.3, audioContext.currentTime)
	compressor.threshold.setValueAtTime(0.4, audioContext.currentTime)
	compressor.ratio.setValueAtTime(1.2, audioContext.currentTime)
	out.gain.setValueAtTime(0.001, audioContext.currentTime)

	void loadImpulses(audioContext, ['star']).then(([impulse]) => {
		if (impulse) reverbA.buffer = reverbB.buffer = impulse
	})

	const start: AudioApi['start'] = async () => {
		if (audioContext.state !== 'running') {
			await audioContext.resume()

			if (!oscillatorsStarted) {
				lfo.start()
				lowOsc.start()
				midOsc.start()
				highOsc.start()
				oscillatorsStarted = true
			}

			out.gain.exponentialRampToValueAtTime(1.0, audioContext.currentTime + 2)
		}
	}

	const stop: AudioApi['stop'] = async () => {
		if (audioContext.state === 'running') {
			out.gain.setValueAtTime(0.001, audioContext.currentTime)
			await audioContext.suspend()
		}
	}

	const toggle: AudioApi['toggle'] = () => {
		if (audioContext.state === 'running') void stop()
		else void start()
	}

	const update: AudioApi['update'] = (world) => {
		if (audioContext.state !== 'running') return

		const time = audioContext.currentTime + 0.06
		const { inactiveRatio, activeRatio, movement } = processWorld(world)

		lowGain.gain.exponentialRampToValueAtTime(inactiveRatio * 0.3, time)
		highGain.gain.exponentialRampToValueAtTime(activeRatio ** 2 * 0.1, time)
		lfo.frequency.linearRampToValueAtTime(movement ** 4 * 40, time)
	}

	return { start, stop, toggle, update }
}

export interface AudioApi {
	start: () => Promise<void>
	stop: () => Promise<void>
	toggle: () => void
	update: (world: WorldState) => void
}
