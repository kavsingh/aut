import { describe, it, expect } from "vitest"

import { mockRandom } from "#__test__/helpers"

import { groupIndecesBy, sample, accessCirc } from "./array"
import { range } from "./number"

describe("util/array", () => {
	describe("sample", () => {
		const source = ["a", "b", "c", "d"]

		it("should sample a random value from array", () => {
			expect.assertions(1)

			const restoreRandom = mockRandom(
				({ calls }) => (source.length - calls.length) / source.length,
			)
			const sampled = new Array(4).fill(0).map(() => sample(source))

			expect(sampled).toStrictEqual(["d", "c", "b", "a"])

			restoreRandom()
		})

		it.each([range(100)])("should always return a value from the array", () => {
			expect.assertions(1)

			expect(source).toContain(sample(source))
		})
	})

	describe("groupIndecesBy", () => {
		it("should group adjacent indeces in array where value satisfies predicate", () => {
			expect.assertions(4)

			const eq1 = (n: number) => n === 1
			const eqA = (s: string) => s === "a"

			expect(groupIndecesBy(eq1, [0, 2, 3, 5, 6, 0])).toStrictEqual([])
			expect(groupIndecesBy(eq1, [0, 1, 0, 1, 1, 0])).toStrictEqual([
				[1],
				[3, 4],
			])
			expect(groupIndecesBy(eq1)([1, 1, 0, 1, 0, 1])).toStrictEqual([
				[0, 1],
				[3],
				[5],
			])
			expect(groupIndecesBy(eqA, ["a", "a", "b"])).toStrictEqual([[0, 1]])
		})
	})

	describe("accessCirc", () => {
		const source = ["a", "b", "c", "d"]
		const accessSource = accessCirc(source)

		it.each([range(100).map((n) => n - 50)])(
			"should always return a value from the array despite out of bounds index",
			(index) => {
				expect.assertions(1)

				expect(source).toContain(accessSource(index))
			},
		)
	})
})
