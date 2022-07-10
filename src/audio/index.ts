import { processWorld } from './process-world'

import type { WorldState } from '~/types'

export const createAudio = (): AudioApi => {
	const audioContext: AudioContext = new AudioContext()

	void audioContext.suspend()

	const lfo = audioContext.createOscillator()
	const lowOsc = audioContext.createOscillator()
	const highOsc = audioContext.createOscillator()
	const lfoGain = audioContext.createGain()
	const lowGain = audioContext.createGain()
	const highGain = audioContext.createGain()
	const out = audioContext.createGain()
	let oscillatorsStarted = false

	lfo.connect(lfoGain)
	lowOsc.connect(lowGain)
	highOsc.connect(highGain)
	lowGain.connect(out)
	highGain.connect(out)
	lfoGain.connect(highGain.gain)
	out.connect(audioContext.destination)

	lfo.type = 'triangle'
	lowOsc.type = 'sine'
	highOsc.type = 'triangle'

	lfo.frequency.setValueAtTime(0.01, audioContext.currentTime)
	lowOsc.frequency.setValueAtTime(120, audioContext.currentTime)
	highOsc.frequency.setValueAtTime(300, audioContext.currentTime)

	lfoGain.gain.setValueAtTime(0.08, audioContext.currentTime)
	out.gain.setValueAtTime(0.5, audioContext.currentTime)

	const start: AudioApi['start'] = async () => {
		if (audioContext.state !== 'running') {
			await audioContext.resume()

			if (!oscillatorsStarted) {
				lfo.start()
				lowOsc.start()
				highOsc.start()
				oscillatorsStarted = true
			}

			out.gain.setValueAtTime(0.001, audioContext.currentTime)
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
		const time = audioContext.currentTime + 0.06
		const { inactiveRatio, activeRatio, movement } = processWorld(world)

		lowGain.gain.exponentialRampToValueAtTime(inactiveRatio * 0.5, time)
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
