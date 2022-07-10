import type { WorldState } from '~/types'

export const processWorld = (world: WorldState) => {
	let activeCount = 0
	let inactiveCount = 0
	let totalCount = 0
	let stateSwitches = 0

	for (let i = 0; i < world.length; i++) {
		const generation = world[i]

		if (!generation) continue

		for (let j = 0; j < world.length; j++) {
			const val = generation[j]

			if (typeof val !== 'number') continue

			totalCount++
			if (val) activeCount++
			else inactiveCount++

			const prev = generation[j - 1]

			if (typeof prev === 'number' && prev !== val) stateSwitches++
		}
	}

	return {
		activeRatio: activeCount / totalCount,
		inactiveRatio: inactiveCount / totalCount,
		movement: stateSwitches / totalCount,
	}
}
