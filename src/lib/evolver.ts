import { accessCirc, last, valueEq } from "./util"
import { seedRandom } from "./world"

import type { EvolutionRule, WorldStateEvolver } from "./types"

export function createEvolver(
	rule: EvolutionRule,
	allowIdentical = false,
): WorldStateEvolver {
	return function evolver(world) {
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
export function createRule(patterns: string[]): EvolutionRule {
	const lookup = new Set(patterns)

	return function rule(a, b, c) {
		return lookup.has(`${a}${b}${c}`) ? 1 : 0
	}
}

function evolve(rule: EvolutionRule, generation: number[]) {
	const access = accessCirc(generation)
	const next: number[] = []

	for (let i = 0; i < generation.length; i++) {
		next.push(rule(access(i - 1), access(i), access(i + 1)))
	}

	return next
}
