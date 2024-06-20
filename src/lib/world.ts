import { range } from "#lib/util/number"

export function seedSingle(len: number) {
	if (!len) return []

	const zeros = range(Math.floor(len / 2)).fill(0)

	return [...(len % 2 === 0 ? zeros.slice(0, -1) : zeros), 1, ...zeros]
}

export function seedRandom(len: number) {
	return range(len).map(() => Math.floor(Math.random() * 2))
}

export function generateInitialWorld(
	generationSize: number,
	maxGenerations: number,
	seedFn = seedSingle,
) {
	return [
		...range(maxGenerations - 1).map(() => range(generationSize).fill(0)),
		seedFn(generationSize),
	]
}
