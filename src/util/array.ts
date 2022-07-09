import { curry } from '@kavsingh/curry-pipe'

import { range } from './number'

import type { PredicateFn } from './types'

export const sample = <T>(arr: T[]): T | undefined =>
	arr[Math.floor(Math.random() * arr.length)]

export const head = <T>([x]: T[]) => x

export const tail = <T>([_x, ...xs]: T[]) => xs

export const last = <T>(arr: T[]) => arr.at(-1)

export const seedSingle = (len: number) => {
	if (!len) return []

	const zeros = range(Math.floor(len / 2)).map(() => 0)

	return len % 2 === 0
		? zeros.slice(0, -1).concat(1).concat(zeros)
		: zeros.concat(1).concat(zeros)
}

export const seedRandom = (len: number) =>
	range(len).map(() => Math.floor(Math.random() * 2))

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
