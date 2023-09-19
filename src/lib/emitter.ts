export function createEmitter<
	TPayload,
	TListener extends (payload: Readonly<TPayload>) => void = (
		payload: Readonly<TPayload>,
	) => void,
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
