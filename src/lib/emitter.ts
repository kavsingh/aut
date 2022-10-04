export const createEmitter = <
	T,
	L extends (payload: T) => void = (payload: T) => void,
>() => {
	const listeners = new Map<L, boolean>()

	const listen = (listener: L) => {
		listeners.set(listener, true)

		return () => {
			listeners.delete(listener)
		}
	}

	const emit = (payload: T) => {
		listeners.forEach((_, listener) => void listener(payload))
	}

	return { listen, emit, clear: listeners.clear.bind(listeners) }
}
