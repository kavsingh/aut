export type ReverbNode = {
	connectFrom(node: AudioNode): void
	connectTo(node: AudioNode): void
	setWetDry(ratio: number, atTime?: number | undefined): void
}
