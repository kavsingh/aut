import { curry } from "@kavsingh/curry-pipe"

export function range(max: number) {
	return Array.from({ length: max }, (_, i) => i)
}

export const circMod = curry((m: number, n: number) => ((n % m) + m) % m)

export const clamp = curry((min: number, max: number, val: number) => {
	if (val < min) return min

	if (val > max) return max

	return val
})
