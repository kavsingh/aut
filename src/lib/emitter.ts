export const createEmitter = <
	T,
	L extends (payload: T) => void = (payload: T) => void,
>() => {
	const listeners: L[] = []

	const listen = (listener: L) => {
		if (!listeners.includes(listener)) listeners.push(listener)

		return () => {
			const listenerIndex = listeners.indexOf(listener)

			if (listenerIndex > -1) listeners.splice(listenerIndex, 1)
		}
	}

	const emit = (payload: T) => {
		listeners.forEach((listener) => listener(payload))
	}

	return { listen, emit }
}
