import { sample, seedSingle, pipe, constant } from './util.js'
import { createCanvasRenderer } from './renderer.js'
import { createEvolver } from './evolver.js'
import * as rules from './rules.js'

const CELL_DIM = 2
const WORLD_WIDTH = 600

const createRandomEvolver = pipe(constant([
    rules.rule3,
    rules.rule18,
    rules.rule45,
    rules.rule57,
    rules.rule73,
    rules.rule182,
    rules.rule225,
]), sample, createEvolver)

const render = createCanvasRenderer(document.getElementById('world'), {
    CELL_DIM,
    width: WORLD_WIDTH,
    height: Math.round(WORLD_WIDTH * 0.8),
})

let worldState = [seedSingle(WORLD_WIDTH / CELL_DIM)]
let evolve = createRandomEvolver()
let switchAccum = 0

const update = () => {
    if (switchAccum >= 60) {
        evolve = createRandomEvolver()
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
