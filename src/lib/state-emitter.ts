import { createEmitter } from './emitter'

export const createStateEmitter = <T>(initialState: T) => {
	const state = initialState
	const emitter = createEmitter<Readonly<T>>()
	const get = (): Readonly<T> => state
	const update = (
		updater: (current: Readonly<T>) => Partial<T>,
	): Readonly<T> => {
		Object.assign(state, updater(state))
		emitter.emit(state)

		return state
	}

	return { get, update, listen: emitter.listen.bind(emitter) }
}
