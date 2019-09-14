import { sample, seedSingle, pipe, constant } from './util.js'
import { createCanvasRenderer } from './renderer.js'
import { createEvolver } from './evolver.js'
import * as rules from './rules.js'

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

const main = containers => {
    const cellDim = 2
    const worldDim = Math.min(
        Math.floor(window.innerWidth / containers.length),
        300,
    )
    const render = createCanvasRenderer(containers, {
        cellDim,
        width: worldDim,
        height: worldDim,
    })
    const switchOver = Math.floor(worldDim / 5)

    let worldState = [seedSingle(worldDim / cellDim)]
    let switchAccum = 0
    let evolve = createRandomEvolver()

    const update = () => {
        switchAccum = switchAccum >= switchOver ? 0 : switchAccum + 1
        evolve = switchAccum === 0 ? createRandomEvolver() : evolve
        worldState = evolve(worldState)
    }

    const onFrame = () => {
        render(worldState)
        window.requestAnimationFrame(onFrame)
    }

    setInterval(update, 14)
    window.requestAnimationFrame(onFrame)
}

if (typeof window !== 'undefined') window.bootApp = main

export default main
