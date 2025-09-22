import { describe, it, expect } from "vitest"

import { circMod, range } from "./number"

describe("util/number", () => {
	describe(range, () => {
		it("should create a range of values", () => {
			expect.assertions(2)

			expect(range(10)).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
			expect(range(0)).toStrictEqual([])
		})
	})

	describe(circMod, () => {
		it("should mod negative numbers the euclidean way", () => {
			expect.assertions(4)

			expect(circMod(3, 3)).toBe(0)
			expect(circMod(3)(-3)).toBe(0)
			expect(circMod(3, -2)).toBe(1)
			expect(circMod(3)(2)).toBe(2)
		})
	})
})
