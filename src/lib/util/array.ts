import { curry } from "@kavsingh/curry-pipe"

import { circMod } from "./number"

import type { PredicateFn } from "./types"

export function sample<TItem>(arr: TItem[]) {
	return arr[Math.floor(Math.random() * arr.length)]
}

export const groupIndecesBy: {
	<TItem>(predicate: PredicateFn<TItem>): (arr: TItem[]) => number[][]
	<TItem>(predicate: PredicateFn<TItem>, arr: TItem[]): number[][]
} = curry((predicate: (...args: unknown[]) => unknown, arr: unknown[]) => {
	const groups: number[][] = []

	for (let i = 0; i < arr.length; i++) {
		if (!predicate(arr[i])) continue

		const currentGroup = groups.at(-1)

		if (currentGroup && currentGroup.at(-1) === i - 1) currentGroup.push(i)
		else groups.push([i])
	}

	return groups
})

export const accessCirc: {
	<TItem>(arr: TItem[]): (index: number) => TItem
	<TItem>(arr: TItem[], index: number): TItem
} = curry((arr: unknown[], index: number) => arr[circMod(arr.length, index)])
