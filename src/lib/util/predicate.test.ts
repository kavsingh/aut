import { describe, it, expect } from "vitest"

import { isFiniteNumber, isTruthy } from "./predicate"

describe("util/predicate", () => {
	describe("isFiniteNumber", () => {
		it.each([
			[0, true],
			[+0, true],
			[-0, true],
			[-1, true],
			[1, true],
			[Number.MAX_SAFE_INTEGER, true],
			[Number.MAX_VALUE, true],
			[Number.MIN_SAFE_INTEGER, true],
			[Number.MIN_VALUE, true],
			[Infinity, false],
			[-Infinity, false],
			[NaN, false],
			[-NaN, false],
			[{}, false],
			[[], false],
			["", false],
			[true, false],
		])("should determine if %s is finite with typeguard", (value, expected) => {
			expect.assertions(1)

			expect(isFiniteNumber(value)).toBe(expected)
		})
	})

	describe("isTruthy", () => {
		it.each([
			[{}, true],
			[[], true],
			[-1, true],
			[true, true],
			[false, false],
			[1, true],
			[0, false],
			[+0, false],
			[-0, false],
			[NaN, false],
			[-NaN, false],
			["", false],
			[null, false],
			[undefined, false],
		])("should determine if %s is truthy with typeguard", (value, expected) => {
			expect.assertions(1)

			expect(isTruthy(value)).toBe(expected)
		})
	})
})
