import test from 'ava'
import sinon from 'sinon'
import { createCanvasRenderer } from './renderer.js'

const getMockCanvas = () => {
    const mockContext = { fillRect: () => {} }
    const contextSpy = sinon.spy(mockContext, 'fillRect')
    return { mock: { getContext: () => mockContext }, spy: contextSpy }
}

test('should draw state to canvas context', t => {
    t.plan(5)

    const { mock, spy } = getMockCanvas()
    const mockContext = mock.getContext()
    const render = createCanvasRenderer(
        mock, { width: 10, height: 10, cellDim: 1 })

    render([[1, 0], [0, 1]])

    t.is(spy.calledOn(mockContext), true)
    t.is(spy.callCount, 3)
    
    // Clear canvas
    t.deepEqual(spy.getCall(0).args, [0, 0, 10, 10])
    // First active, second row from bottom (state is 2 rows)
    t.deepEqual(spy.getCall(1).args, [0, 8, 1, 1])
    // Second active, first row from bottom, second column
    // (last row drawn at bottom of height)
    t.deepEqual(spy.getCall(2).args, [1, 9, 1, 1])
})

test('should draw only visible rows from state', t => {
    t.plan(5)

    const { mock, spy } = getMockCanvas()
    const render = createCanvasRenderer(
        mock, { width: 10, height: 4, cellDim: 2 })

    render([[1, 0], [0, 1], [0, 1], [0, 0], [1, 0], [1, 1]])

    // Draw only active state in last 2 rows:
    // height 4, cell height 2 = 2 max rows visible
    t.is(spy.callCount, 4)

    // clear
    t.deepEqual(spy.getCall(0).args, [0, 0, 10, 4])

    // draw
    t.deepEqual(spy.getCall(1).args, [0, 0, 2, 2])
    t.deepEqual(spy.getCall(2).args, [0, 2, 2, 2])
    t.deepEqual(spy.getCall(3).args, [2, 2, 2, 2])
})
