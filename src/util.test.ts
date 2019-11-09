import {
	curry,
	last,
	head,
	range,
	circMod,
	seedSingle,
	seedRandom,
	pipe,
	groupIndecesBy,
	eq,
	sample,
	constant,
	valueEq,
} from './util'

const mockRandom = (fn: (mock: jest.MockContext<any, any>) => unknown) => {
	const _Math = window.Math // Should be provided by jest
	const random = jest.fn()
	const mockMath = Object.create(_Math)

	mockMath.random = (...args: Parameters<typeof Math.random>) => {
		random(...args)
		return fn(random.mock)
	}

	window.Math = mockMath

	return () => (window.Math = _Math)
}

describe('Util', () => {
	it('Should curry a function', () => {
		const add = curry((a: number, b: number, c: number) => a + b + c)

		expect(add(1, 2, 3)).toBe(6)
		expect(add(1)(2, 3)).toBe(6)
		expect(add(1, 2)(3)).toBe(6)
		expect(add(1, 2)()(3)).toBe(6)
		expect(typeof add(1)(2)).toBe('function')
	})

	it('Should sample a random value from array', () => {
		const source = [1, 2, 3, 4]
		const restoreRandom = mockRandom(
			({ calls }) => (source.length - calls.length) / source.length,
		)
		const sampled = new Array(4).fill(0).map(() => sample(source))

		expect(sampled).toEqual([4, 3, 2, 1])

		restoreRandom()
	})

	it('Should create an array with random 0s and 1s', () => {
		const restoreRandom = mockRandom(({ calls }) =>
			calls.length <= 500 ? 0.001 : 0.999,
		)

		const result = seedRandom(1000)

		expect(result.some(r => r !== 1 && r !== 0)).toBe(false)
		expect(result.filter(r => r === 0)).toHaveLength(500)
		expect(result.filter(r => r === 1)).toHaveLength(500)

		restoreRandom()
	})

	it('Should check values are strictly equal', () => {
		expect(eq(1, 2)).toBe(false)
		expect(eq(NaN, NaN)).toBe(false)
		expect(eq(1)(3)).toBe(false)
		expect(eq(1)(1)).toBe(true)
	})

	it('Should get the last element in an array', () => {
		expect(last([])).toBeUndefined()
		expect(last([1])).toBe(1)
		expect(last([1, 2])).toBe(2)
	})

	it('Should get the first element in an array', () => {
		expect(head([])).toBeUndefined()
		expect(head([1])).toBe(1)
		expect(head([1, 2])).toBe(1)
	})

	it('Should group adjacent indeces in array where value satisfies predicate', () => {
		const eq1 = (n: number) => n === 1
		const eqA = (s: string) => s === 'a'

		expect(groupIndecesBy(eq1, [0, 2, 3, 5, 6, 0])).toEqual([])
		expect(groupIndecesBy(eq1, [0, 1, 0, 1, 1, 0])).toEqual([[1], [3, 4]])
		expect(groupIndecesBy(eq1)([1, 1, 0, 1, 0, 1])).toEqual([[0, 1], [3], [5]])
		expect(groupIndecesBy(eqA, ['a', 'a', 'b'])).toEqual([[0, 1]])
	})

	it('Should create a range of values', () => {
		expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
		expect(range(0)).toEqual([])
	})

	it('Should mod negative numbers the euclidean way', () => {
		expect(circMod(3, 3)).toBe(0)
		expect(circMod(3)(-3)).toBe(0)
		expect(circMod(3, -2)).toBe(1)
		expect(circMod(3)(2)).toBe(2)
	})

	it('Should create a single positive value in the center of an n-length array', () => {
		expect(seedSingle(5)).toEqual([0, 0, 1, 0, 0])
		expect(seedSingle(6)).toEqual([0, 0, 1, 0, 0, 0])
		expect(seedSingle(1)).toEqual([1])
		expect(seedSingle(2)).toEqual([1, 0])
		expect(seedSingle(0)).toEqual([])
	})

	it('Should compose functions left to right with first fn of any arity', () => {
		const add = (a: number, b: number) => a + b
		const double = (x: number) => x * 2
		const addThenDouble = pipe(add, double)

		expect(addThenDouble(1, 2)).toBe(6)
	})

	it('Should create a function that always returns the same value', () => {
		const byRef = {}

		expect(constant(byRef)()).toBe(byRef)
	})

	it('Should check that inputs are equal by value', () => {
		const sameRef = {}

		expect(valueEq(undefined, undefined)).toBe(true)
		expect(valueEq(undefined, null)).toBe(false)
		expect(valueEq(NaN, null)).toBe(false)
		expect(valueEq(null, null)).toBe(true)
		expect(valueEq(NaN, NaN)).toBe(true)
		expect(valueEq(Infinity, Infinity)).toBe(true)
		expect(valueEq(-Infinity, -Infinity)).toBe(true)
		expect(valueEq(Infinity, -Infinity)).toBe(false)
		expect(valueEq(+0, -0)).toBe(true)
		expect(valueEq(1, '1')).toBe(false)
		expect(valueEq(1, null)).toBe(false)
		expect(valueEq(1, undefined)).toBe(false)
		expect(valueEq(1, NaN)).toBe(false)
		expect(valueEq(1, 1)).toBe(true)
		expect(valueEq('1', '1')).toBe(true)
		expect(valueEq(sameRef, sameRef)).toBe(true)
		expect(valueEq([], [])).toBe(true)
		expect(valueEq([1, 2], [1, 2])).toBe(true)
		expect(valueEq([2, 1], [1, 2])).toBe(false)
		expect(valueEq([1, 2, 3], [1, 2])).toBe(false)
		expect(valueEq({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
		expect(
			valueEq({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 }),
		).toBe(true)
	})
})
