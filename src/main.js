import { sample, seedSingle, pipe } from './util.js'
import { createCanvasRenderer } from './renderer.js'
import {
    createEvolver,
    rule18,
    rule45,
    rule57,
    rule73,
    rule182,
    rule225,
} from './evolver.js'

;(function () {
    const rules = [rule18, rule45, rule57, rule73, rule182, rule225]
    const cellDim = 3
    const width = 600
    const createRandomEvolver = pipe(sample, createEvolver)
    const render = createCanvasRenderer(document.getElementById('world'), {
        cellDim,
        width,
        height: cellDim * 110,
    })

    let worldState = [seedSingle(width / cellDim)]
    let evolve = createRandomEvolver(rules)

    const update = tick => {
        if ((tick % 350) < 10) evolve = createRandomEvolver(rules)
        worldState = evolve(worldState)
        render(worldState)
    }

    const onframe = () => {
        window.requestAnimationFrame(tick => {
            update(tick)
            onframe()
        })
    }

    onframe()
}())
