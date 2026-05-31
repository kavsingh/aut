import { describe, expect, it } from "vitest"

import {
	isTransitionPayloadValid,
	selectHorizontalTransitionValue,
	shouldInjectPulse,
} from "./renderer-wgpu-worlds"

describe("renderer wgpu worlds helpers", () => {
	it("validates transition payload sizes", () => {
		expect.assertions(2)

		const valid = {
			fromLookup: new Uint32Array(24),
			toLookup: new Uint32Array(24),
			progress: new Float32Array(3),
		}
		const invalid = {
			fromLookup: new Uint32Array(16),
			toLookup: new Uint32Array(24),
			progress: new Float32Array(3),
		}

		expect(isTransitionPayloadValid(valid, 24, 3)).toBe(true)
		expect(isTransitionPayloadValid(invalid, 24, 3)).toBe(false)
	})

	it("selects horizontal transition value by progress", () => {
		expect.assertions(4)

		expect(selectHorizontalTransitionValue(0, 1, 0)).toBe(0)
		expect(selectHorizontalTransitionValue(0, 1, 0.2)).toBe(0)
		expect(selectHorizontalTransitionValue(0, 1, 0.5)).toBe(1)
		expect(selectHorizontalTransitionValue(0, 1, 1)).toBe(1)
	})

	it("computes pulse injection deterministically", () => {
		expect.assertions(4)

		expect(
			shouldInjectPulse({
				nextValue: 0,
				stepCounter: 194,
				reseedStride: 97,
				col: 0,
				worldIndex: 0,
				worldWidth: 300,
			}),
		).toBe(true)
		expect(
			shouldInjectPulse({
				nextValue: 0,
				stepCounter: 194,
				reseedStride: 97,
				col: 1,
				worldIndex: 0,
				worldWidth: 300,
			}),
		).toBe(false)
		expect(
			shouldInjectPulse({
				nextValue: 1,
				stepCounter: 194,
				reseedStride: 97,
				col: 0,
				worldIndex: 0,
				worldWidth: 300,
			}),
		).toBe(false)
		expect(
			shouldInjectPulse({
				nextValue: 0,
				stepCounter: 194,
				reseedStride: 0,
				col: 0,
				worldIndex: 0,
				worldWidth: 300,
			}),
		).toBe(false)
	})
})
