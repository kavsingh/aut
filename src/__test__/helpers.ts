import { vi } from "vitest"

import type { MockContext } from "vitest"

export function mockRandom(fn: (mock: MockContext<any, any>) => number) {
	const _Math = globalThis.Math
	const random = vi.fn()
	const mockMath: typeof _Math = Object.create(_Math)

	mockMath.random = function mockedRandom(
		...args: Parameters<typeof Math.random>
	) {
		random(...args)

		return fn(random.mock)
	}

	globalThis.Math = mockMath

	return function unmock() {
		globalThis.Math = _Math
	}
}
