import { accessCirc, last, valueEq } from './util'
import { seedRandom } from './world'

import type { EvolutionRule, WorldStateEvolver } from './types'

const evolve = (rule: EvolutionRule, generation: number[]) => {
	const access = accessCirc(generation)

	return generation.map((_, index) =>
		rule(access(index - 1), access(index), access(index + 1)),
	)
}

export const createEvolver =
	(rule: EvolutionRule, allowIdentical = false): WorldStateEvolver =>
	(world) => {
		const currentGeneration = last(world)

		if (!currentGeneration) return world

		const maxGenerations = world.length
		const nextGeneration = evolve(rule, currentGeneration)
		const nextWorld = world.concat([
			!allowIdentical && valueEq(currentGeneration, nextGeneration)
				? seedRandom(currentGeneration.length)
				: nextGeneration,
		])

		if (nextWorld.length > maxGenerations) nextWorld.shift()

		return nextWorld
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
