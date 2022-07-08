import { createRule, createEvolver } from './evolver'
import * as util from './util'

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
		const initState = [[0, 0, 1, 0, 0, 0, 1, 1, 0]]

		const evolve1 = createEvolver(createRule(['001', '110']))
		const expectedState1 = initState.concat([[0, 1, 0, 0, 0, 1, 0, 1, 0]])
		const expectedState1Stage2 = expectedState1.concat([
			[1, 0, 0, 0, 1, 0, 0, 0, 0],
		])

		const evolve2 = createEvolver(createRule([]))
		const expectedState2 = initState.concat([[0, 0, 0, 0, 0, 0, 0, 0, 0]])

		const evolve3 = createEvolver(
			createRule(['000', '001', '010', '011', '100', '101', '110', '111']),
		)
		const expectedState3 = initState.concat([[1, 1, 1, 1, 1, 1, 1, 1, 1]])

		expect(evolve1(initState)).toEqual(expectedState1)
		expect(evolve1(expectedState1)).toEqual(expectedState1Stage2)
		expect(evolve2(initState)).toEqual(expectedState2)
		expect(evolve3(initState)).toEqual(expectedState3)
	})

	it('should not perpetuate identical generations', () => {
		jest.spyOn(util, 'seedRandom').mockImplementationOnce(() => [0, 1, 0])

		const evolve = createEvolver(createRule([]))

		expect(evolve([[0, 0, 0]])).toEqual([
			[0, 0, 0],
			[0, 1, 0],
		])
		;(util.seedRandom as jest.Mock).mockRestore()
	})
})
