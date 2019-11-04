// TODO: Figure out how to type these things nicely
/* eslint-disable @typescript-eslint/no-explicit-any */
export const curry = (fn: any) => (...args: any[]) =>
	args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args))

type TEMPPipeFn = (...args: any[]) => any
export const pipe = (firstFn: TEMPPipeFn, ...fns: TEMPPipeFn[]) => (
	...firstArgs: Parameters<typeof firstFn>
) => fns.reduce((result, fn) => fn(result), firstFn(...firstArgs))
/* eslint-enable */

export const eq = curry((a: unknown, b: unknown) => a === b)

export const range = (max: number) => Array.from({ length: max }, (_, i) => i)

export const circMod = curry((m: number, n: number) => ((n % m) + m) % m)

export const sample = <T>(arr: T[]) =>
	arr[Math.floor(Math.random() * arr.length)]

export const last = <T>(arr: T[]) => arr[arr.length - 1]

export const head = <T>(arr: T[]) => arr[0]

export const take = curry(<T>(n: number, arr: T[]) =>
	n < 0 ? arr.slice(n) : arr.slice(0, n),
)

export const constant = <T>(val: T) => () => val

export const seedSingle = (len: number) => {
	if (!len) return []
	const zeros = range(Math.floor(len / 2)).map(() => 0)

	return len % 2 === 0
		? zeros
				.slice(0, -1)
				.concat(1)
				.concat(zeros)
		: zeros.concat(1).concat(zeros)
}

export const seedRandom = (len: number) =>
	range(len).map(() => Math.floor(Math.random() * 2))

type Condition<T, R> = [(val: T) => boolean, (val: T) => R]

export const cond = <T, R>(conditions: Condition<T, R>[]) => (val: T) => {
	for (let i = 0; i < conditions.length; i++) {
		const [predicate, exec] = conditions[i]
		if (predicate(val)) return exec(val)
	}

	return undefined
}

type PredicateFn = <T>(value: T) => boolean

export const takeIndexWhile = curry(<T>(predicate: PredicateFn, arr: T[]) => {
	const result = []

	for (let i = 0; i < arr.length; i++) {
		if (predicate(arr[i])) result.push(i)
		else if (result.length) return result
	}

	return result
})

export const groupIndecesBy = curry(<T>(predicate: PredicateFn, arr: T[]) => {
	const groups = []

	for (let i = 0; i < arr.length; i++) {
		if (!predicate(arr[i])) continue

		const currentGroup = last(groups)

		if (currentGroup && last(currentGroup) === i - 1) currentGroup.push(i)
		else groups.push([i])
	}

	return groups
})

export const flatten = <T>(arr: (T | T[])[]) =>
	arr.reduce((flat: T[], val) => flat.concat(val), [])

const isValueNaN = (value: unknown): value is number =>
	Number.isNaN(value as number)

const isTypeofObject = (value: unknown): value is { [key: string]: unknown } =>
	typeof value === 'object'

export const valueEq = curry((a: unknown, b: unknown) => {
	if (eq(a, b)) return true

	if (isValueNaN(a) && isValueNaN(b)) return true

	if (isTypeofObject(a) && isTypeofObject(b)) {
		const [aKeys, bKeys] = [a, b].map(Object.keys)

		return aKeys.length !== bKeys.length
			? false
			: aKeys.every(key => valueEq(a[key], b[key]))
	}

	return false
})
