import { curry } from "@kavsingh/curry-pipe"

export const eq = curry((a: unknown, b: unknown) => a === b)

export const valueEq = curry((a: unknown, b: unknown): boolean => {
	if (eq(a, b)) return true

	if (isValueNaN(a) && isValueNaN(b)) return true

	if (isTypeofObject(a) && isTypeofObject(b)) {
		const aKeys = Object.keys(a)
		const bKeys = Object.keys(b)

		return aKeys.length !== bKeys.length
			? false
			: aKeys.every((key) => valueEq(a[key], b[key]))
	}

	return false
})

function isValueNaN(value: unknown): value is number {
	return Number.isNaN(value as number)
}

function isTypeofObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object"
}
