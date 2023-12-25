import { describe, it, expect, vi } from "vitest"

import { createRule, createEvolver } from "./evolver"
import * as world from "./world"

describe("evolver", () => {
	it.each([
		[[0, 0, 0], 0],
		[[0, 0, 1], 1],
		[[0, 1, 0], 0],
		[[0, 1, 1], 0],
		[[1, 0, 0], 0],
		[[1, 0, 1], 0],
		[[1, 1, 0], 1],
		[[1, 1, 1], 1],
	] satisfies [[number, number, number], number][])(
		"should create a rule to return next state",
		(input, expected) => {
			expect.assertions(1)

			const rule = createRule(["001", "110", "111"])

			expect(rule(...input)).toBe(expected)
		},
	)

	it("should create a function that evolves state", () => {
		expect.assertions(4)

		const initState = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 1, 0],
		]

		const evolve1 = createEvolver(createRule(["001", "110"]))
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
			createRule(["000", "001", "010", "011", "100", "101", "110", "111"]),
		)
		const expectedState3 = [
			[0, 0, 1, 0, 0, 0, 1, 1, 0],
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
		]

		expect(evolve1(initState)).toStrictEqual(expectedState1)
		expect(evolve1(expectedState1)).toStrictEqual(expectedState1Stage2)
		expect(evolve2(initState)).toStrictEqual(expectedState2)
		expect(evolve3(initState)).toStrictEqual(expectedState3)
	})

	it("should not perpetuate identical generations if allowIndentical is false (default)", () => {
		expect.assertions(1)

		vi.spyOn(world, "seedRandom").mockImplementationOnce(() => [0, 1, 0])

		const evolve = createEvolver(createRule([]))

		expect(
			evolve([
				[0, 0, 0],
				[0, 0, 0],
			]),
		).toStrictEqual([
			[0, 0, 0],
			[0, 1, 0],
		])
	})

	it("should perpetuate identical generations if allowIndentical is true", () => {
		expect.assertions(1)

		vi.spyOn(world, "seedRandom").mockImplementationOnce(() => [0, 1, 0])

		const evolve = createEvolver(createRule([]), true)

		expect(
			evolve([
				[0, 0, 0],
				[0, 0, 0],
			]),
		).toStrictEqual([
			[0, 0, 0],
			[0, 0, 0],
		])
	})
})
