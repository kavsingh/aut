import { curry } from "@kavsingh/curry-pipe"

import { circMod } from "./number"

import type { PredicateFn } from "./types"

export function sample<T>(arr: T[]): T {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return arr[Math.floor(Math.random() * arr.length)]!
}

export function head<T>([x]: T[]) {
	return x
}

export function tail<T>([_x, ...xs]: T[]) {
	return xs
}

export function last<T>(arr: T[]) {
	return arr.at(-1)
}

export const groupIndecesBy: {
	<T>(predicate: PredicateFn<T>): (arr: T[]) => number[][]
	<T>(predicate: PredicateFn<T>, arr: T[]): number[][]
} = curry((predicate: (...args: unknown[]) => unknown, arr: unknown[]) => {
	const groups = []

	for (let i = 0; i < arr.length; i++) {
		if (!predicate(arr[i])) continue

		const currentGroup = last(groups)

		if (currentGroup && last(currentGroup) === i - 1) currentGroup.push(i)
		else groups.push([i])
	}

	return groups
})

export const findLast: {
	<T>(predicate: PredicateFn<T>): (arr: T[]) => T | undefined
	<T>(predicate: PredicateFn<T>, arr: T[]): T | undefined
} = curry((predicate: (...args: unknown[]) => unknown, arr: unknown[]) => {
	for (let i = arr.length - 1; i >= 0; i--) {
		const val = arr[i]

		if (predicate(val)) return val
	}

	return undefined
})

export const accessCirc: {
	<T>(arr: T[]): (index: number) => T
	<T>(arr: T[], index: number): T
} = curry((arr: unknown[], index: number) => arr[circMod(arr.length, index)])
