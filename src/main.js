import { seedSingle } from './util.js'
import * as rules from './rules.js'
import { addRuleThumbnails } from './thumbnails'
import { startAnimations } from './animations'

const main = (canvases, thumbnailsContainer) => {
    const cellDim = 2
    const worldDim = Math.min(
        Math.floor(window.innerWidth / canvases.length),
        300,
    )

    const state = {
        cellDim,
        worldDim,
        rules: [
            rules.rule3,
            rules.rule18,
            rules.rule45,
            rules.rule57,
            rules.rule73,
            rules.rule182,
            rules.rule225,
        ],
        evolver: undefined,
        world: [seedSingle(worldDim / cellDim)],
    }

    const thumbnails = addRuleThumbnails(state.rules, thumbnailsContainer)

    thumbnails.forEach(({ element, evolver }) => {
        element.addEventListener('click', () => (state.evolver = evolver))
    })

    canvases.forEach(canvas =>
        canvas.addEventListener('click', () => (state.evolver = undefined)),
    )

    startAnimations(state, canvases)
}

if (typeof window !== 'undefined') window.bootApp = main

export default main
