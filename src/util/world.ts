import { range } from './number'

export const seedSingle = (len: number) => {
	if (!len) return []

	const zeros = range(Math.floor(len / 2)).map(() => 0)

	return len % 2 === 0
		? zeros.slice(0, -1).concat(1).concat(zeros)
		: zeros.concat(1).concat(zeros)
}

export const seedRandom = (len: number) =>
	range(len).map(() => Math.floor(Math.random() * 2))

export const generateInitialWorld = (
	generationSize: number,
	maxGenerations: number,
	seedFn = seedSingle,
) => [
	...range(maxGenerations - 1).map(() => Array<number>(generationSize).fill(0)),
	seedFn(generationSize),
]
