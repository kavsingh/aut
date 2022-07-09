import { describe, it, expect } from 'vitest'

import { mockRandom } from '~/__test__/helpers'

import { last, head, groupIndecesBy, sample } from './array'

describe('util/array', () => {
	describe('sample', () => {
		it('Should sample a random value from array', () => {
			const source = [1, 2, 3, 4]
			const restoreRandom = mockRandom(
				({ calls }) => (source.length - calls.length) / source.length,
			)
			const sampled = new Array(4).fill(0).map(() => sample(source))

			expect(sampled).toEqual([4, 3, 2, 1])

			restoreRandom()
		})
	})

	describe('last', () => {
		it('Should get the last element in an array', () => {
			expect(last([])).toBeUndefined()
			expect(last([1])).toBe(1)
			expect(last([1, 2])).toBe(2)
		})
	})

	describe('head', () => {
		it('Should get the first element in an array', () => {
			expect(head([])).toBeUndefined()
			expect(head([1])).toBe(1)
			expect(head([1, 2])).toBe(1)
		})
	})

	describe('groupIndecesBy', () => {
		it('Should group adjacent indeces in array where value satisfies predicate', () => {
			const eq1 = (n: number) => n === 1
			const eqA = (s: string) => s === 'a'

			expect(groupIndecesBy(eq1, [0, 2, 3, 5, 6, 0])).toEqual([])
			expect(groupIndecesBy(eq1, [0, 1, 0, 1, 1, 0])).toEqual([[1], [3, 4]])
			expect(groupIndecesBy(eq1)([1, 1, 0, 1, 0, 1])).toEqual([
				[0, 1],
				[3],
				[5],
			])
			expect(groupIndecesBy(eqA, ['a', 'a', 'b'])).toEqual([[0, 1]])
		})
	})
})
