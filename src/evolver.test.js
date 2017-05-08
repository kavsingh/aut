import test from 'ava'
import { createRule, createEvolver } from './evolver.js'

test('create a rule to return next state', t => {
    t.plan(8)

    const rule = createRule(['001', '110', '111'])

    t.is(rule(0, 0, 0), 0)
    t.is(rule(0, 0, 1), 1)
    t.is(rule(0, 1, 0), 0)
    t.is(rule(0, 1, 1), 0)
    t.is(rule(1, 0, 0), 0)
    t.is(rule(1, 0, 1), 0)
    t.is(rule(1, 1, 0), 1)
    t.is(rule(1, 1, 1), 1)
})

test('create a function that evolves state', t => {
    t.plan(4)

    const initState = [[0, 0, 1, 0, 0, 0, 1, 1, 0]]

    const evolve1 = createEvolver(createRule(['001', '110']))
    const expectedState1 = initState.concat([[0, 1, 0, 0, 0, 1, 0, 1, 0]])
    const expectedState1_2 = expectedState1.concat(
        [[1, 0, 0, 0, 1, 0, 0, 0, 0]],
    )

    const evolve2 = createEvolver(createRule([]))
    const expectedState2 = initState.concat([[0, 0, 0, 0, 0, 0, 0, 0, 0]])

    const evolve3 = createEvolver(
        createRule(['000', '001', '010', '011', '100', '101', '110', '111']))
    const expectedState3 = initState.concat([[1, 1, 1, 1, 1, 1, 1, 1, 1]])

    t.deepEqual(evolve1(initState), expectedState1)
    t.deepEqual(evolve1(expectedState1), expectedState1_2)
    t.deepEqual(evolve2(initState), expectedState2)
    t.deepEqual(evolve3(initState), expectedState3)
})
