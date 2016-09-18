import { sample, seedSingle, pipe } from './util.js'
import { createCanvasRenderer } from './renderer.js'
import { createEvolver } from './evolver.js'
import {
    rule3,
    rule18,
    rule45,
    rule57,
    rule73,
    rule182,
    rule225,
} from './rules.js'

const rules = [rule3, rule18, rule45, rule57, rule73, rule182, rule225]
const cellDim = 2
const width = 600
const createRandomEvolver = pipe(sample, createEvolver)
const render = createCanvasRenderer(document.getElementById('world'), {
    cellDim,
    width,
    height: Math.round(width * 0.8),
})

let worldState = [seedSingle(width / cellDim)]
let evolve = createRandomEvolver(rules)
let switchAccum = 0

const update = () => {
    if (switchAccum >= 60) {
        evolve = createRandomEvolver(rules)
        switchAccum = 0
    }
    worldState = evolve(worldState)
    render(worldState)
    switchAccum++
}

const onFrame = tick => {
    update(tick)
    window.requestAnimationFrame(onFrame)
}

window.requestAnimationFrame(onFrame)
