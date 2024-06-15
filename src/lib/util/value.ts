import { curry } from "@kavsingh/curry-pipe"

import type { Nullish } from "./types"

export const defaultTo: {
	<TValue>(defaultVal: TValue): (val: TValue | Nullish) => TValue
	<TValue>(defaultVal: TValue, val: TValue | Nullish): TValue
} = curry((defaultVal: unknown, val: unknown) => val ?? defaultVal)

export function constant<TValue>(val: TValue) {
	return function value(..._: unknown[]) {
		return val
	}
}
