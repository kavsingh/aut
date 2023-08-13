export function createEmitter<
	TPayload,
	TListener extends (payload: TPayload) => void = (payload: TPayload) => void,
>() {
	const listeners = new Set<TListener>()

	function listen(listener: TListener) {
		listeners.add(listener)

		return function stopListening() {
			listeners.delete(listener)
		}
	}

	function emit(payload: TPayload) {
		for (const listener of listeners) {
			listener(payload)
		}
	}

	return { listen, emit, clear: listeners.clear.bind(listeners) }
}
