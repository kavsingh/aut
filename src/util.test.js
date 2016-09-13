import test from 'ava'
import { range, mod, any, seedSingle, pipe } from './util.js'

test('creates a range of values', t => {
    t.plan(2)
    t.deepEqual(range(10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    t.deepEqual(range(0), [])
})

test('implements negative mod correctly', t => {
    t.plan(4)
    t.is(0, mod(3, 3))
    t.is(0, mod(-3, 3))
    t.is(2, mod(2, 3))
    t.is(1, mod(-2, 3))
})

test('check if predicate matches any element of array', t => {
    t.plan(2)

    t.is(any(x => x === 2)([1, 2, 3]), true)
    t.is(any(x => x === 2)([1, 4, 3]), false)
})

test('create a single active value in the center of an n-length array', t => {
    t.plan(5)

    t.deepEqual(seedSingle(5), [0, 0, 1, 0, 0])
    t.deepEqual(seedSingle(6), [0, 0, 1, 0, 0, 0])
    t.deepEqual(seedSingle(1), [1])
    t.deepEqual(seedSingle(2), [1, 0])
    t.deepEqual(seedSingle(0), [])
})

test('compose functions left to right', t => {
    t.plan(1)

    const fn1 = (a, b) => a + b
    const fn2 = x => x * 2
    const fn = pipe(fn1, fn2)

    t.is(fn(1, 2), 6)
})
