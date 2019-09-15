import { eq, mathMod, seedRandom } from './util.js'

export const createEvolver = rule => state => {
    const input = state[state.length - 1]
    const modLength = mathMod(input.length)

    return input.every(eq(1)) || input.every(eq(0))
        ? state.concat([seedRandom(input.length)])
        : state.concat([
              input.map((_, index) =>
                  rule(
                      input[modLength(index - 1)],
                      input[index],
                      input[modLength(index + 1)],
                  ),
              ),
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
