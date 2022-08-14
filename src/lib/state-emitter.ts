import { createEmitter } from './emitter'

export const createStateEmitter = <T extends Record<string, unknown>>(
	initialState: T,
) => {
	const state = initialState
	const emitter = createEmitter<Readonly<T>>()
	const get = (): T => state
	const update = (updater: (current: T) => Partial<T>): T => {
		Object.assign(state, updater(state))

		emitter.emit(state)

		return state
	}

	return {
		get,
		update,
		listen: emitter.listen.bind(emitter),
		clear: emitter.clear.bind(emitter),
	}
}
