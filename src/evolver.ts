import { circMod, isFiniteNumber, last, seedRandom, valueEq } from './util'

import type { EvolutionRule, WorldStateEvolver } from './types'

const evolve = (rule: EvolutionRule, generation: number[]) => {
	const modLength = circMod(generation.length)

	return generation.map((_, index) => {
		const a = generation[modLength(index - 1)]
		const b = generation[index]
		const c = generation[modLength(index + 1)]

		return isFiniteNumber(a) && isFiniteNumber(b) && isFiniteNumber(c)
			? rule(a, b, c)
			: 0
	})
}

// ⚠️ mutates state
export const createEvolver =
	(rule: EvolutionRule): WorldStateEvolver =>
	(world) => {
		const currentGeneration = last(world)

		if (!currentGeneration) return world

		const maxGenerations = world.length
		const nextGeneration = evolve(rule, currentGeneration)

		world.push(
			valueEq(currentGeneration, nextGeneration)
				? seedRandom(currentGeneration.length)
				: nextGeneration,
		)

		if (world.length > maxGenerations) world.shift()

		return world
	}

/*
    codifies rules as described in http://atlas.wolfram.com/01/01/
    takes an array of previous generation combos that should result in a
    next generation state of 1 (active, or black, or what have you)

    i.e. given a rule as described in the link above
    where # is black and - is white

    #--    --#    #-#
     #      -      #

    100    001    101
     1      0      1

    the rule is codified by createRule(['100', '101'])
*/
export const createRule = (patterns: string[]): EvolutionRule => {
	const lookup = Object.fromEntries(patterns.map((pattern) => [pattern, true]))

	return (a, b, c) => (lookup[`${a}${b}${c}`] ? 1 : 0)
}
