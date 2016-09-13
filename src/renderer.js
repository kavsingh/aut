export function createCanvasRenderer(
    canvas,
    {
        width = 200,
        height = 200,
        cellDim = 2,
        inactiveFill = '#FFFFFF',
        activeFill = '#000000',
    } = {}
) {
    const context = canvas.getContext('2d')
    const maxRows = Math.floor(height / cellDim)
    const clear = _ => {
        context.fillStyle = inactiveFill
        context.fillRect(0, 0, width, height)
    }
    const drawRow = (row, yOffset) => {
        for (let i = 0; i < row.length; i++) {
            context.fillStyle = row[i] ? activeFill : inactiveFill
            context.fillRect(i * cellDim, yOffset, cellDim, cellDim)
        }
    }

    canvas.width = width
    canvas.height = height

    return state => {
        clear()
        const startIdx = Math.max(0, state.length - maxRows)
        for (let i = startIdx; i < state.length; i++) {
            drawRow(state[i], (height - ((state.length - i) * cellDim)))
        }
    }
}
