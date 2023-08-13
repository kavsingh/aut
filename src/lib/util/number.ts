import { curry } from "@kavsingh/curry-pipe"

export function range(max: number) {
	return Array.from({ length: max }, (_, i) => i)
}

export const circMod = curry((m: number, n: number) => ((n % m) + m) % m)
