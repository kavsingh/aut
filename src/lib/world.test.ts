import { describe, it, expect } from 'vitest'

import { mockRandom } from '~/__test__/helpers'

import { seedSingle, seedRandom } from './world'

describe('util/world', () => {
	describe('seedRandom', () => {
		it('Should create an array with random 0s and 1s', () => {
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

	describe('seedSingle', () => {
		it('Should create a single positive value in the center of an n-length array', () => {
			expect(seedSingle(5)).toEqual([0, 0, 1, 0, 0])
			expect(seedSingle(6)).toEqual([0, 0, 1, 0, 0, 0])
			expect(seedSingle(1)).toEqual([1])
			expect(seedSingle(2)).toEqual([1, 0])
			expect(seedSingle(0)).toEqual([])
		})
	})
})
