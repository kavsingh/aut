import { describe, it, expect } from "vitest"

import { constant, defaultTo } from "./value"

describe("util/value", () => {
	describe("constant", () => {
		it("should create a function that always returns the same value", () => {
			expect.assertions(2)

			const byRef = {}
			const getRef = constant(byRef)

			expect(getRef()).toBe(byRef)
			expect(getRef()).toBe(byRef)
		})
	})

	describe("defaultTo", () => {
		it("should return a default value for nullish values", () => {
			expect.assertions(4)

			const defaultToFoo = defaultTo("foo")

			expect(defaultToFoo("yam")).toBe("yam")
			expect(defaultToFoo(undefined)).toBe("foo")
			expect(defaultTo("foo", null)).toBe("foo")
			expect(defaultTo(5)(10)).toBe(10)
		})
	})
})
