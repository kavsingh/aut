// https://gist.github.com/tommyettinger/46a874533244883189143505d203312c?permalink_comment_id=4577493#gistcomment-4577493
export function mulberry32(seed: number) {
	let s = hash(seed)

	return function rand() {
		s = (s + 0x9e3779b9) | 0

		let z = s

		z ^= z >>> 16
		z = Math.imul(z, 0x21f0aaad)
		z ^= z >>> 15
		z = Math.imul(z, 0x735a2d97)
		z ^= z >>> 15

		return z
	}
}

// knuth's simple 32-bit integer hash
// https://gist.github.com/blixt/f17b47c62508be59987b?permalink_comment_id=2792771#gistcomment-2792771
function hash(n: number) {
	return Math.imul(n, 2654435761) >>> 0
}
