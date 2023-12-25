import { describe, it, expect } from "vitest"

import { mockRandom } from "#__test__/helpers"

import { seedSingle, seedRandom } from "./world"

describe("util/world", () => {
	describe("seedRandom", () => {
		/* eslint-disable vitest/no-conditional-in-test, vitest/no-conditional-tests */
		it("should create an array with random 0s and 1s", () => {
			expect.assertions(3)

			const restoreRandom = mockRandom(({ calls }) =>
				calls.length <= 500 ? 0.001 : 0.999,
			)

			const result = seedRandom(1000)

			expect(result.some((r) => r !== 1 && r !== 0)).toBeFalsy()
			expect(result.filter((r) => r === 0)).toHaveLength(500)
			expect(result.filter((r) => r === 1)).toHaveLength(500)

			restoreRandom()
		})
		/* eslint-enable */
	})

	describe("seedSingle", () => {
		it("should create a single positive value in the center of an n-length array", () => {
			expect.assertions(5)

			expect(seedSingle(5)).toStrictEqual([0, 0, 1, 0, 0])
			expect(seedSingle(6)).toStrictEqual([0, 0, 1, 0, 0, 0])
			expect(seedSingle(1)).toStrictEqual([1])
			expect(seedSingle(2)).toStrictEqual([1, 0])
			expect(seedSingle(0)).toStrictEqual([])
		})
	})
})
