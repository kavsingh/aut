/* eslint-env jest */

import {
    curry,
    cond,
    last,
    head,
    range,
    mathMod,
    seedSingle,
    seedRandom,
    pipe,
    groupIndecesBy,
    eq,
    take,
    sample,
    flatten,
    constant,
    takeIndexWhile,
} from './util.js'

const mockRandom = fn => {
    const _Math = window.Math
    const random = jest.fn()
    const mockMath = Object.create(_Math)

    mockMath.random = (...args) => {
        random(...args)
        return fn(random.mock)
    }

    window.Math = mockMath

    return () => window.Math = _Math
}

describe('Util', () => {
    it('Should curry a function', () => {
        const add = curry((a, b, c) => a + b + c)

        expect(add(1, 2, 3)).toBe(6)
        expect(add(1)(2, 3)).toBe(6)
        expect(add(1, 2)(3)).toBe(6)
        expect(add(1, 2)()(3)).toBe(6)
        expect(typeof add(1)(2)).toBe('function')
    })

    it('Should return conditional result', () => {
        const conditions = cond([
            [n => n > 5, n => n * 3],
            [n => n > 2, n => n * 2],
            [() => true, n => n],
        ])

        expect(conditions(10)).toBe(30)
        expect(conditions(4)).toBe(8)
        expect(conditions(1)).toBe(1)
        expect(conditions(null)).toBe(null)
        expect(cond([[n => n > 5, n => n]], 2)).toBe(undefined)
    })

    it('Should sample a random value from array', () => {
        const restoreRandom = mockRandom(mock => (4 - mock.calls.length) / 4)
        const source = [1, 2, 3, 4]
        const sampled = (new Array(4)).fill(0).map(() => sample(source))

        expect(sampled).toEqual([4, 3, 2, 1])

        restoreRandom()
    })

    it('Should create an array with random 0s and 1s', () => {
        const restoreRandom = mockRandom(
            mock => (mock.calls.length <= 500 ? 0.001 : 0.999))

        const result = seedRandom(1000)

        expect(result.some(r => r !== 1 && r !== 0)).toBe(false)
        expect(result.filter(r => r === 0).length).toBe(500)
        expect(result.filter(r => r === 1).length).toBe(500)

        restoreRandom()
    })

    it('Should check values are strictly equal', () => {
        expect(eq(1, 2)).toBe(false)
        expect(eq(NaN, NaN)).toBe(false)
        expect(eq(1)(3)).toBe(false)
        expect(eq(1)(1)).toBe(true)
    })

    it('Should get the last element in an array', () => {
        expect(last([])).toBe(undefined)
        expect(last([1])).toBe(1)
        expect(last([1, 2])).toBe(2)
    })

    it('Should take indeces from start of array while predicate is true', () => {
        expect(takeIndexWhile(n => n > 10)([1, 2, 3, 4])).toEqual([])
        expect(takeIndexWhile(n => n > 2, [1, 2, 3, 4])).toEqual([2, 3])
        expect(takeIndexWhile(n => n > 1 && n < 4)([1, 2, 3, 4]))
            .toEqual([1, 2])
        expect(takeIndexWhile(n => n > 1 && n < 4)([1, 2, 5, 3, 4]))
            .toEqual([1])
    })

    it('Should take n values from start of array', () => {
        expect(take(2)([])).toEqual([])
        expect(take(2, [1])).toEqual([1])
        expect(take(2)([1, 2, 3])).toEqual([1, 2])
    })

    it('Should take n values from end of array', () => {
        expect(take(-2)([])).toEqual([])
        expect(take(-2)([1])).toEqual([1])
        expect(take(-2)([1, 2, 3])).toEqual([2, 3])
    })

    it('Should get the first element in an array', () => {
        expect(head([])).toBe(undefined)
        expect(head([1])).toBe(1)
        expect(head([1, 2])).toBe(1)
    })

    it('Should group adjacent indeces in array where value satisfies predicate', () => {
        const eq1 = n => n === 1

        expect(groupIndecesBy(eq1, [0, 2, 3, 5, 6, 0])).toEqual([])
        expect(groupIndecesBy(eq1, [0, 1, 0, 1, 1, 0])).toEqual([[1], [3, 4]])
        expect(groupIndecesBy(eq1)([1, 1, 0, 1, 0, 1]))
            .toEqual([[0, 1], [3], [5]])
    })

    it('Should create a range of values', () => {
        expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        expect(range(0)).toEqual([])
    })

    it('Should mod negative numbers the euclidean way', () => {
        expect(mathMod(3, 3)).toBe(0)
        expect(mathMod(3)(-3)).toBe(0)
        expect(mathMod(3, -2)).toBe(1)
        expect(mathMod(3)(2)).toBe(2)
    })

    it('Should create a single positive value in the center of an n-length array', () => {
        expect(seedSingle(5)).toEqual([0, 0, 1, 0, 0])
        expect(seedSingle(6)).toEqual([0, 0, 1, 0, 0, 0])
        expect(seedSingle(1)).toEqual([1])
        expect(seedSingle(2)).toEqual([1, 0])
        expect(seedSingle(0)).toEqual([])
    })

    it('Should compose functions left to right with first fn of any arity', () => {
        const add = (a, b) => a + b
        const double = x => x * 2
        const addThenDouble = pipe(add, double)

        expect(addThenDouble(1, 2)).toBe(6)
    })

    it('Should shallow flatten arrays', () => {
        expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4])
        expect(flatten([[1, [2, 3]], 4])).toEqual([1, [2, 3], 4])
    })

    it('Should create a function that always returns the same value', () => {
        const byRef = {}

        expect(typeof constant()).toBe('function')
        expect(constant()()).toBe(undefined)
        expect(constant(byRef)()).toBe(byRef)
        expect(constant(byRef)(5)).toBe(byRef)
        expect(constant([1, 2])([100])).toEqual([1, 2])
    })
})
