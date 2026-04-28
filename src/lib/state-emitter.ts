import { Emitter } from "./emitter"

export class StateEmitter<TState extends Record<string, unknown>> {
	readonly #emitter = new Emitter<Immutable<TState>>()
	readonly #state: TState

	constructor(initialState: TState) {
		this.#state = structuredClone(initialState)
	}

	// oxlint-disable typescript/no-unsafe-type-assertion
	get(): Immutable<TState> {
		return this.#state as Immutable<TState>
	}

	updateMut(updater: (current: TState) => void): Immutable<TState> {
		updater(this.#state)

		this.#emitter.emit(this.#state as Immutable<TState>)

		return this.#state as Immutable<TState>
	}
	// oxlint-enable typescript/no-unsafe-type-assertion

	listen(...args: Parameters<Emitter<Immutable<TState>>["listen"]>) {
		return this.#emitter.listen(...args)
	}

	clear() {
		this.#emitter.clear()
	}
}
