import { describe, expect, it } from "vitest"

import {
	isRulePayloadValid,
	selectRuleStopIndex,
	shouldInjectPulse,
} from "./renderer-wgpu-worlds"

describe("renderer wgpu worlds helpers", () => {
	it("validates rule payload sizes", () => {
		expect.assertions(2)

		const valid = {
			ruleLookups: new Uint32Array(288),
			transitionRatios: new Float32Array(36),
			ruleCounts: new Uint32Array(3),
			reseedFlags: new Uint32Array(3),
		}
		const invalid = {
			ruleLookups: new Uint32Array(16),
			transitionRatios: new Float32Array(36),
			ruleCounts: new Uint32Array(3),
			reseedFlags: new Uint32Array(3),
		}

		expect(
			isRulePayloadValid(valid, {
				lookupSize: 288,
				ratioSize: 36,
				worldCount: 3,
			}),
		).toBe(true)
		expect(
			isRulePayloadValid(invalid, {
				lookupSize: 288,
				ratioSize: 36,
				worldCount: 3,
			}),
		).toBe(false)
	})

	it("selects rule stop index by ratio", () => {
		expect.assertions(4)

		expect(selectRuleStopIndex([0], 0.2)).toBe(0)
		expect(selectRuleStopIndex([0, 0.4, 0.9], 0.2)).toBe(0)
		expect(selectRuleStopIndex([0, 0.4, 0.9], 0.5)).toBe(1)
		expect(selectRuleStopIndex([0, 0.4, 0.9], 1)).toBe(2)
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
