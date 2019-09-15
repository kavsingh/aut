import { mathMod, seedRandom, valueEq } from './util.js'

export const createEvolver = rule => state => {
    const input = state[state.length - 1]
    const modLength = mathMod(input.length)
    const next = input.map((_, index) =>
        rule(
            input[modLength(index - 1)],
            input[index],
            input[modLength(index + 1)],
        ),
    )

    return state.concat([
        valueEq(input, next) ? seedRandom(input.length) : next,
    ])
}

/*
    codifies rules as described in http://atlas.wolfram.com/01/01/
    takes an array of previous generation combos that should result in a
    next generation state of 1 (active, or black, or what have you)

    i.e. given a rule as described in the link above
    where # is black and - is white

    #--    --#    #-#
     #      -      #

    100    001    101
     1      0      1

    the rule is codified by createRule(['100', '101'])
*/
export const createRule = patterns => (a, b, c) =>
    patterns.includes(`${a}${b}${c}`) ? 1 : 0
