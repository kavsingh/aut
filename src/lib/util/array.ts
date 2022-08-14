import { curry } from '@kavsingh/curry-pipe'

import { circMod } from './number'

import type { PredicateFn } from './types'

export const sample = <T>(arr: T[]): T =>
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	arr[Math.floor(Math.random() * arr.length)]!

export const head = <T>([x]: T[]) => x

export const tail = <T>([_x, ...xs]: T[]) => xs

export const last = <T>(arr: T[]) => arr.at(-1)

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
})

export const accessCirc: {
	<T>(arr: T[]): (index: number) => T
	<T>(arr: T[], index: number): T
} = curry((arr: unknown[], index: number) => arr[circMod(arr.length, index)])
