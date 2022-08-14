export const isFiniteNumber = (value: unknown): value is number =>
	Number.isFinite(value)

export const isTruthy = <T>(value: T): value is NonNullable<T> => !!value
