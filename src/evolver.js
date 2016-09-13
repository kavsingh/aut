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

export const createRule = patterns => (a, b, c) => {
    const inPattern = [a, b, c].join('')
    const hasMatch = any(pattern => pattern === inPattern) 
 
    return hasMatch(patterns) ? 1 : 0
}

// http://atlas.wolfram.com/01/01/
export const rule18 = createRule(['100', '001'])
export const rule45 = createRule(['101', '011', '010', '000'])
export const rule57 = createRule(['101', '100', '011', '000'])
export const rule73 = createRule(['110', '011', '000'])
export const rule90 = createRule(['001', '100', '011', '001'])
export const rule160 = createRule(['111', '101'])
export const rule182 = createRule(['111', '101', '100', '010', '001'])
export const rule225 = createRule(['111', '110', '101', '000'])

export const rules = [rule18, rule45, rule57, rule73, rule182]
