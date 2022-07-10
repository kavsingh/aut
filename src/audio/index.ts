import type { WorldState } from '~/types'

export const createAudio = (): AudioApi => {
	const audioContext: AudioContext = new AudioContext()

	void audioContext.suspend()

	const lowOsc = audioContext.createOscillator()
	const highOsc = audioContext.createOscillator()
	const lowGain = audioContext.createGain()
	const highGain = audioContext.createGain()
	const out = audioContext.createGain()
	let oscillatorsStarted = false

	lowOsc.connect(lowGain)
	highOsc.connect(highGain)
	lowGain.connect(out)
	highGain.connect(out)
	out.connect(audioContext.destination)

	const start: AudioApi['start'] = async () => {
		if (audioContext.state !== 'running') {
			await audioContext.resume()

			if (!oscillatorsStarted) {
				lowOsc.frequency.setValueAtTime(100, audioContext.currentTime)
				highOsc.frequency.setValueAtTime(300, audioContext.currentTime)
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
		// for loops fast
		let activeCount = 0
		let inactiveCount = 0
		let totalCount = 0

		for (let i = 0; i < world.length; i++) {
			const generation = world[i]

			if (!generation) continue
			for (let j = 0; j < world.length; j++) {
				const val = generation[j]

				if (typeof val !== 'number') continue

				totalCount++
				if (val) activeCount++
				else inactiveCount++
			}
		}

		const activeRatio = activeCount / totalCount
		const inactiveRatio = inactiveCount / totalCount

		lowGain.gain.linearRampToValueAtTime(
			inactiveRatio,
			audioContext.currentTime + 0.06,
		)
		highGain.gain.linearRampToValueAtTime(
			activeRatio ** 2,
			audioContext.currentTime + 0.06,
		)
	}

	return { start, stop, toggle, update }
}

export interface AudioApi {
	start: () => Promise<void>
	stop: () => Promise<void>
	toggle: () => void
	update: (world: WorldState) => void
}
