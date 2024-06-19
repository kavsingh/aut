export class Emitter<
	TPayload,
	TListener extends (payload: TPayload) => void = (payload: TPayload) => void,
> {
	#listeners = new Set<TListener>()

	listen(listener: TListener) {
		this.#listeners.add(listener)

		const stopListening = () => {
			this.#listeners.delete(listener)
		}

		return stopListening
	}

	emit(payload: TPayload) {
		for (const listener of this.#listeners) listener(payload)
	}

	clear() {
		this.#listeners.clear()
	}
}
