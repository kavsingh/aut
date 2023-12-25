import { describe, it, expect } from "vitest"

import { eq, valueEq } from "./compare"

describe("util/compare", () => {
	describe("eq", () => {
		it.each([
			[1, 2, false],
			[NaN, NaN, false],
			[1, 3, false],
			[{}, {}, false],
			[[], [], false],
			["a", "a", true],
			[1, 1, true],
		])("should %s and %s are strictly equal", (a, b, result) => {
			expect.assertions(2)

			expect(eq(a, b)).toBe(result)
			expect(eq(a)(b)).toBe(result)
		})
	})

	describe("valueEq", () => {
		it.each([
			[undefined, null, false],
			[Infinity, -Infinity, false],
			[1, "1", false],
			[1, null, false],
			[1, undefined, false],
			[1, NaN, false],
			[NaN, null, false],
			[[2, 1], [1, 2], false],
			[[1, 2, 3], [1, 2], false],
			[{ a: 1, b: 2 }, { b: 2, c: 3, a: 1 }, false],
			[undefined, undefined, true],
			[null, null, true],
			[NaN, NaN, true],
			[Infinity, Infinity, true],
			[-Infinity, -Infinity, true],
			[+0, -0, true],
			[1, 1, true],
			["1", "1", true],
			[{}, {}, true],
			[[], [], true],
			[[1, 2], [1, 2], true],
			[{ a: 1, b: 2 }, { b: 2, a: 1 }, true],
			[{ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 }, true],
		])("should check that %s equals %s by value", (a, b, result) => {
			expect.assertions(2)

			expect(valueEq(a, b)).toBe(result)
			expect(valueEq(a)(b)).toBe(result)
		})
	})
})
