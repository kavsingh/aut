import { curry } from "@kavsingh/curry-pipe"

import type { Nullish } from "./types"

export const defaultTo: {
	<T>(defaultVal: T): (val: T | Nullish) => T
	<T>(defaultVal: T, val: T | Nullish): T
} = curry((defaultVal: unknown, val: unknown) => val ?? defaultVal)

export function constant<T>(val: T) {
	return function value(..._args: unknown[]) {
		return val
	}
}
