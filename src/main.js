import { sample, seedSingle, pipe, constant } from './util.js'
import { createCanvasRenderer } from './renderer.js'
import { createEvolver } from './evolver.js'
import * as rules from './rules.js'

const CELL_DIM = 2
const WORLD_WIDTH = 600

const createRandomEvolver = pipe(
    constant([
        rules.rule3,
        rules.rule18,
        rules.rule45,
        rules.rule57,
        rules.rule73,
        rules.rule182,
        rules.rule225,
    ]),
    sample,
    createEvolver,
)

let worldState = [seedSingle(WORLD_WIDTH / CELL_DIM)]
let switchAccum = 0
let evolve = createRandomEvolver()

const main = container => {
    const render = createCanvasRenderer(container, {
        CELL_DIM,
        width: WORLD_WIDTH,
        height: Math.round(WORLD_WIDTH * 0.8),
    })

    const update = () => {
        switchAccum = switchAccum >= 60 ? 0 : switchAccum + 1
        evolve = switchAccum === 0 ? createRandomEvolver() : evolve
        render((worldState = evolve(worldState)))
    }

    const onFrame = tick => {
        update(tick)
        window.requestAnimationFrame(onFrame)
    }

    window.requestAnimationFrame(onFrame)
}

if (typeof window !== 'undefined') window.bootApp = main

export default main
