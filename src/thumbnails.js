import { range, seedRandom } from './util.js'
import { createCanvasRenderer } from './renderer.js'
import { createEvolver } from './evolver.js'

const createRuleThumbnail = rule => {
    const thumbnailDim = 40
    const ruleCanvas = document.createElement('canvas')
    const ruleRenderer = createCanvasRenderer([ruleCanvas], {
        cellDim: 1,
        width: thumbnailDim,
        height: thumbnailDim,
    })
    const evolver = createEvolver(rule)
    const state = range(thumbnailDim).reduce(acc => evolver(acc), [
        seedRandom(thumbnailDim),
    ])

    ruleRenderer(state)

    return { evolver, element: ruleCanvas }
}

export const addRuleThumbnails = (rules, container) => {
    const thumbnails = rules.map(createRuleThumbnail)

    thumbnails.forEach(({ element }) => container.appendChild(element))

    return thumbnails
}
