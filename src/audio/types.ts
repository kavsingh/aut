export interface EffectNode {
	connectFrom(node: AudioNode): void
	connectTo(node: AudioNode): void
	setWetDry(ratio: number, atTime?: number): void
}
