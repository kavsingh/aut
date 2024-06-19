import { Emitter } from "./emitter"

export class StateEmitter<TState extends Record<string, unknown>> {
	#emitter = new Emitter<Immutable<TState>>()
	#state: TState

	constructor(initialState: TState) {
		this.#state = { ...initialState }
	}

	get(): Immutable<TState> {
		return this.#state as Immutable<TState>
	}

	updateMut(updater: (current: TState) => void): Immutable<TState> {
		updater(this.#state)

		this.#emitter.emit(this.#state as Immutable<TState>)

		return this.#state as Immutable<TState>
	}

	listen(...args: Parameters<Emitter<Immutable<TState>>["listen"]>) {
		return this.#emitter.listen(...args)
	}

	clear() {
		this.#emitter.clear()
	}
}
