import { curry } from "@kavsingh/curry-pipe"

export const valueEq = curry((a: unknown, b: unknown): boolean => {
	if (Number.isNaN(a) && Number.isNaN(b)) return true

	if (a && b && typeof a === "object" && typeof b === "object") {
		const aKeys = Object.keys(a)
		const bKeys = Object.keys(b)

		if (aKeys.length !== bKeys.length) return false

		return aKeys.every((key) => {
			return valueEq(a[key as keyof typeof a], b[key as keyof typeof b])
		})
	}

	return a === b
})
