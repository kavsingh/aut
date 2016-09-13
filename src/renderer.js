export const createCanvasRenderer = (canvas, props = {}) => {
    const cellDim = props.cellDim || 2
    const inactiveFill = props.inactiveFill || '#FFFFFF'
    const activeFill = props.activeFill || '#000000'
    const context = canvas.getContext('2d')
    const clear = _ => {
        context.fillStyle = inactiveFill
        context.fillRect(0, 0, canvas.width, canvas.height)
    }
    const drawRow = (row, yOffset) => {
        for (let i = 0; i < row.length; i++) {
            context.fillStyle = row[i] ? activeFill : inactiveFill
            context.fillRect(i * cellDim, yOffset, cellDim, cellDim)
        }
    }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    return state => {
        clear()
        const startIdx = Math.max(
            0, state.length - Math.floor(canvas.height / cellDim))
        for (let i = startIdx; i < state.length; i++) {
            drawRow(
                state[i], (canvas.height - ((state.length - i) * cellDim)))
        }
    }
}