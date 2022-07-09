import { describe, it, expect } from 'vitest'

import { isFiniteNumber } from './predicate'

describe('util/predicate', () => {
	describe('isFiniteNumber', () => {
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
			['', false],
			[true, false],
		])('Should determine if %s is finite with typeguard', (value, expected) => {
			expect(isFiniteNumber(value)).toBe(expected)
		})
	})
})
