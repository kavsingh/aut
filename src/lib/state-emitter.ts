import { Emitter } from "./emitter"

export class StateEmitter<TState extends Record<string, unknown>> {
	#emitter = new Emitter<Readonly<TState>>()
	#state: TState

	constructor(initialState: TState) {
		this.#state = { ...initialState }
	}

	get(): Readonly<TState> {
		return this.#state
	}

	update(
		updater: (current: Readonly<TState>) => Partial<TState> | null | undefined,
	): Readonly<TState> {
		const updateResult = updater(this.#state)

		if (updateResult) Object.assign(this.#state, updateResult)

		this.#emitter.emit(this.#state)

		return this.#state
	}

	listen(...args: Parameters<Emitter<TState>["listen"]>) {
		return this.#emitter.listen(...args)
	}

	clear() {
		this.#emitter.clear()
	}
}
