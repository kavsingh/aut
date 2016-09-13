import { any, mod } from './util.js'

export const createEvolver = rule => state => {
    const input = state[state.length - 1]
    const len = input.length
    const output = []

    for (let i = 0; i < len; i++) {
        output.push(rule(
            input[mod(i - 1, len)],
            input[i],
            input[mod(i + 1, len)]
        ))
    }

    return state.concat([output])
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
export const createRule = patterns => (a, b, c) => {
    const inPattern = [a, b, c].join('')
    const hasMatch = any(pattern => pattern === inPattern) 
 
    return hasMatch(patterns) ? 1 : 0
}
