import test from 'ava'
import sinon from 'sinon'
import {
    curry,
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

test('currys variadic fn', t => {
    t.plan(5)

    const add = curry((a, b, c) => a + b + c)

    t.is(add(1, 2, 3), 6)
    t.is(add(1)(2, 3), 6)
    t.is(add(1, 2)(3), 6)
    t.is(add(1, 2)()(3), 6)
    t.is(typeof add(1)(2), 'function')
})

test('samples a value from array', t => {
    t.plan(1)

    const spy = sinon.stub(Math, 'random', () => (4 - spy.callCount) / 4)
    const source = [1, 2, 3, 4]
    const sampled = (new Array(4)).fill(0).map(() => sample(source))

    t.deepEqual(sampled, [4, 3, 2, 1])

    Math.random.restore()
})

test('creates an array with random 0 and 1', t => {
    t.plan(3)

    const spy = sinon.stub(Math, 'random', () =>
        (spy.callCount <= 500 ? 0.001 : 0.999))

    const result = seedRandom(1000)

    t.is(result.some(r => r !== 1 && r !== 0), false)
    t.is(result.filter(r => r === 0).length, 500)
    t.is(result.filter(r => r === 1).length, 500)

    Math.random.restore()
})

test('checks values equal', t => {
    t.plan(4)

    t.is(eq(1, 2), false)
    t.is(eq(NaN, NaN), false)
    t.is(eq(1)(3), false)
    t.is(eq(1)(1), true)
})

test('gets last element of an array', t => {
    t.plan(3)

    t.is(last([]), undefined)
    t.is(last([1]), 1)
    t.is(last([1, 2]), 2)
})

test('take indeces from start of array while predicate is true', t => {
    t.plan(4)

    t.deepEqual(takeIndexWhile(n => n > 10)([1, 2, 3, 4]), [])
    t.deepEqual(takeIndexWhile(n => n > 2, [1, 2, 3, 4]), [2, 3])
    t.deepEqual(takeIndexWhile(n => n > 1 && n < 4)([1, 2, 3, 4]), [1, 2])
    t.deepEqual(takeIndexWhile(n => n > 1 && n < 4)([1, 2, 5, 3, 4]), [1])
})

test('take n values from start of array', t => {
    t.plan(3)

    t.deepEqual(take(2)([]), [])
    t.deepEqual(take(2, [1]), [1])
    t.deepEqual(take(2)([1, 2, 3]), [1, 2])
})

test('take n values from end of array', t => {
    t.plan(3)

    t.deepEqual(take(-2)([]), [])
    t.deepEqual(take(-2)([1]), [1])
    t.deepEqual(take(-2)([1, 2, 3]), [2, 3])
})

test('gets first value of an array', t => {
    t.plan(3)

    t.is(head([]), undefined)
    t.is(head([1]), 1)
    t.is(head([1, 2]), 1)
})

test('groups adjacent indeces of specified value in array', t => {
    t.plan(3)

    const eq1 = n => n === 1

    t.deepEqual(groupIndecesBy(eq1, [0, 2, 3, 5, 6, 0]), [])
    t.deepEqual(groupIndecesBy(eq1, [0, 1, 0, 1, 1, 0]), [[1], [3, 4]])
    t.deepEqual(groupIndecesBy(eq1)([1, 1, 0, 1, 0, 1]), [[0, 1], [3], [5]])
})

test('creates a range of values', t => {
    t.plan(2)

    t.deepEqual(range(10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    t.deepEqual(range(0), [])
})

test('implements negative mod correctly', t => {
    t.plan(4)

    t.is(mathMod(3, 3), 0)
    t.is(mathMod(3)(-3), 0)
    t.is(mathMod(3, -2), 1)
    t.is(mathMod(3)(2), 2)
})

test('create a single active value in the center of an n-length array', t => {
    t.plan(5)

    t.deepEqual(seedSingle(5), [0, 0, 1, 0, 0])
    t.deepEqual(seedSingle(6), [0, 0, 1, 0, 0, 0])
    t.deepEqual(seedSingle(1), [1])
    t.deepEqual(seedSingle(2), [1, 0])
    t.deepEqual(seedSingle(0), [])
})

test('pipe composes functions left to right with variadic first fn', t => {
    t.plan(1)

    const fn1 = (a, b) => a + b
    const fn2 = x => x * 2
    const fn = pipe(fn1, fn2)

    t.is(fn(1, 2), 6)
})

test('shallow flatten arrays', t => {
    t.plan(2)

    t.deepEqual(flatten([[1, 2], [3, 4]]), [1, 2, 3, 4])
    t.deepEqual(flatten([[1, [2, 3]], 4]), [1, [2, 3], 4])
})

test('return a function that always returns the same value', t => {
    t.plan(4)

    const byRef = {}

    t.is(typeof constant(), 'function')
    t.is(constant()(), undefined)
    t.is(byRef === constant(byRef)(), true)
    t.deepEqual(constant([1, 2])(), [1, 2])
})
