import impulseStar from './star.wav'
import impulseWide from './wide.wav'

export const loadImpulse = async (
	audioContext: AudioContext,
	name: ImpulseName,
) => {
	const response = await fetch(impulseUrls[name])
	const arrayBuffer = await response.arrayBuffer()

	return audioContext.decodeAudioData(arrayBuffer)
}

export type ImpulseName = keyof typeof impulseUrls

const impulseUrls = {
	star: impulseStar,
	wide: impulseWide,
}
