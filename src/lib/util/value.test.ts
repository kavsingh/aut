import { describe, it, expect } from 'vitest'

import { constant, defaultTo } from './value'

describe('util/value', () => {
	describe('constant', () => {
		it('Should create a function that always returns the same value', () => {
			const byRef = {}
			const getRef = constant(byRef)

			expect(getRef()).toBe(byRef)
			expect(getRef()).toBe(byRef)
		})
	})

	describe('defaultTo', () => {
		it('Should return a default value for nullish values', () => {
			const defaultToFoo = defaultTo('foo')

			expect(defaultToFoo('yam')).toBe('yam')
			expect(defaultToFoo(undefined)).toBe('foo')
			expect(defaultTo('foo', null)).toBe('foo')
			expect(defaultTo(5)(10)).toBe(10)
		})
	})
})
