import test from 'ava'
import { range } from './util.js'

test('creates a range of values', t => {
    t.plan(1)
    t.deepEqual(range(10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})