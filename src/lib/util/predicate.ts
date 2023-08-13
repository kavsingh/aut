export function isFiniteNumber(value: unknown): value is number {
	return Number.isFinite(value)
}

export function isTruthy<T>(
	value: T,
): value is Exclude<T, null | undefined | 0 | false | ""> {
	return !!value
}
