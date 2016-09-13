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
    const render = createCanvasRenderer(
        document.getElementById('world'), { cellDim: 4 })
    const rules = [rule18, rule45, rule57, rule73, rule182, rule225]
    const createRandomEvolver = pipe(sample, createEvolver)

    let worldState = [seedSingle(201)]
    let evolve = createRandomEvolver(rules)

    const update = tick => {
        if ((tick % 350) < 10) evolve = createRandomEvolver(rules)
        worldState = evolve(worldState)
        render(worldState)
    }

    const onframe = () => {
        requestAnimationFrame(tick => {
            update(tick)
            onframe()
        })
    }

    onframe()
}())
