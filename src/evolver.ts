import { circMod, seedRandom, valueEq } from './util'
import { EvolutionRule, WorldStateEvolver } from './types'

const evolve = (rule: EvolutionRule, generation: number[]) => {
	const modLength = circMod(generation.length)

	return generation.map((_, index) =>
		rule(
			generation[modLength(index - 1)],
			generation[index],
			generation[modLength(index + 1)],
		),
	)
}

export const createEvolver = (rule: EvolutionRule): WorldStateEvolver => (
	state,
) => {
	const generation = state[state.length - 1]
	const nextGeneration = evolve(rule, generation)

	return state.concat([
		valueEq(generation, nextGeneration)
			? seedRandom(generation.length)
			: nextGeneration,
	])
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
export const createRule = (patterns: string[]): EvolutionRule => (a, b, c) =>
	patterns.includes(`${a}${b}${c}`) ? 1 : 0
