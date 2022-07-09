import { vi } from 'vitest'

import type { MockContext } from 'vitest'

export const mockRandom = (fn: (mock: MockContext<any, any>) => number) => {
	const _Math = globalThis.Math
	const random = vi.fn()
	const mockMath: typeof _Math = Object.create(_Math)

	mockMath.random = (...args: Parameters<typeof Math.random>) => {
		random(...args)
		return fn(random.mock)
	}

	globalThis.Math = mockMath

	return () => (globalThis.Math = _Math)
}
