import { createEmitter } from "./emitter"

export const createStateEmitter = <T extends Record<string, unknown>>(
	initialState: T,
) => {
	const state = { ...initialState }
	const emitter = createEmitter<Readonly<T>>()

	function get(): Readonly<T> {
		return { ...state }
	}

	function update(
		updater: (current: Readonly<T>) => Partial<T> | null | undefined,
	): Readonly<T> {
		const updateResult = updater(state)

		if (updateResult) Object.assign(state, updateResult)

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
