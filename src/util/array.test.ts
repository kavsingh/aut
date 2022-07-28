import { describe, it, expect } from 'vitest'

import { mockRandom } from '~/__test__/helpers'

import {
	last,
	head,
	groupIndecesBy,
	sample,
	findLast,
	accessCirc,
} from './array'
import { range } from './number'

describe('util/array', () => {
	describe('sample', () => {
		const source = ['a', 'b', 'c', 'd']

		it('Should sample a random value from array', () => {
			const restoreRandom = mockRandom(
				({ calls }) => (source.length - calls.length) / source.length,
			)
			const sampled = new Array(4).fill(0).map(() => sample(source))

			expect(sampled).toEqual(['d', 'c', 'b', 'a'])

			restoreRandom()
		})

		it.each([range(100)])('Should always return a value from the array', () => {
			expect(source.includes(sample(source))).toBe(true)
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

	describe('findLast', () => {
		it('Should find last item satisfying predicate', () => {
			const arr = [{ val: 2 }, { val: 1 }, { val: 1 }, { val: 3 }]
			const findLast1 = findLast(({ val }) => val === 1)

			expect(arr.indexOf(findLast1(arr)!)).toBe(2)
		})
	})

	describe('accessCirc', () => {
		const source = ['a', 'b', 'c', 'd']
		const accessSource = accessCirc(source)

		it.each([range(100).map((n) => n - 50)])(
			'Should always return a value from the array despite out of bounds index',
			(index) => {
				expect(source.includes(accessSource(index))).toBe(true)
			},
		)
	})
})
