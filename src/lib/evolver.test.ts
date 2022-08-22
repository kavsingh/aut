import { describe, it, expect, vi } from 'vitest'

import { createRule, createEvolver } from './evolver'
import * as world from './world'

describe('Evolver', () => {
	it('Should create a rule to return next state', () => {
		const rule = createRule(['001', '110', '111'])

		expect(rule(0, 0, 0)).toBe(0)
		expect(rule(0, 0, 1)).toBe(1)
		expect(rule(0, 1, 0)).toBe(0)
		expect(rule(0, 1, 1)).toBe(0)
		expect(rule(1, 0, 0)).toBe(0)
		expect(rule(1, 0, 1)).toBe(0)
		expect(rule(1, 1, 0)).toBe(1)
		expect(rule(1, 1, 1)).toBe(1)
	})

	it('Should create a function that evolves state', () => {
		const initState = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 1, 0],
		]

		const evolve1 = createEvolver(createRule(['001', '110']))
		const expectedState1 = [
			[0, 0, 1, 0, 0, 0, 1, 1, 0],
			[0, 1, 0, 0, 0, 1, 0, 1, 0],
		]
		const expectedState1Stage2 = [
			[0, 1, 0, 0, 0, 1, 0, 1, 0],
			[1, 0, 0, 0, 1, 0, 0, 0, 0],
		]

		const evolve2 = createEvolver(createRule([]))
		const expectedState2 = [
			[0, 0, 1, 0, 0, 0, 1, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
		]

		const evolve3 = createEvolver(
			createRule(['000', '001', '010', '011', '100', '101', '110', '111']),
		)
		const expectedState3 = [
			[0, 0, 1, 0, 0, 0, 1, 1, 0],
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
		]

		expect(evolve1(initState)).toEqual(expectedState1)
		expect(evolve1(expectedState1)).toEqual(expectedState1Stage2)
		expect(evolve2(initState)).toEqual(expectedState2)
		expect(evolve3(initState)).toEqual(expectedState3)
	})

	it('should not perpetuate identical generations if allowIndentical is false (default)', () => {
		vi.spyOn(world, 'seedRandom').mockImplementationOnce(() => [0, 1, 0])

		const evolve = createEvolver(createRule([]))

		expect(
			evolve([
				[0, 0, 0],
				[0, 0, 0],
			]),
		).toEqual([
			[0, 0, 0],
			[0, 1, 0],
		])
	})

	it('should perpetuate identical generations if allowIndentical is true', () => {
		vi.spyOn(world, 'seedRandom').mockImplementationOnce(() => [0, 1, 0])

		const evolve = createEvolver(createRule([]), true)

		expect(
			evolve([
				[0, 0, 0],
				[0, 0, 0],
			]),
		).toEqual([
			[0, 0, 0],
			[0, 0, 0],
		])
	})
})
