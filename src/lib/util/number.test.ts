import { describe, it, expect } from 'vitest'

import { circMod, range } from './number'

describe('util/number', () => {
	describe('range', () => {
		it('Should create a range of values', () => {
			expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
			expect(range(0)).toEqual([])
		})
	})

	describe('circMod', () => {
		it('Should mod negative numbers the euclidean way', () => {
			expect(circMod(3, 3)).toBe(0)
			expect(circMod(3)(-3)).toBe(0)
			expect(circMod(3, -2)).toBe(1)
			expect(circMod(3)(2)).toBe(2)
		})
	})
})
