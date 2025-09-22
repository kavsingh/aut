import { describe, it, expect } from "vitest"

import { mockRandom } from "#__test__/helpers"

import { seedSingle, seedRandom } from "./world"

describe("util/world", () => {
	describe(seedRandom, () => {
		it("should create an array with random 0s and 1s", () => {
			expect.assertions(3)

			const restoreRandom = mockRandom(({ calls }) =>
				calls.length <= 500 ? 0.001 : 0.999,
			)

			const result = seedRandom(1000)

			expect(result.some((r) => r !== 1 && r !== 0)).toBe(false)
			expect(result.filter((r) => r === 0)).toHaveLength(500)
			expect(result.filter((r) => r === 1)).toHaveLength(500)

			restoreRandom()
		})
	})

	describe(seedSingle, () => {
		it.each([
			[0, []],
			[1, [1]],
			[2, [1, 0]],
			[5, [0, 0, 1, 0, 0]],
			[6, [0, 0, 1, 0, 0, 0]],
		])(
			"should create an array of length %s filled with 0s and a single 1 at the center",
			(len, expected) => {
				expect.assertions(1)

				expect(seedSingle(len)).toStrictEqual(expected)
			},
		)
	})
})
