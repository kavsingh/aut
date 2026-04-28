import type { WorldState } from "~/lib/types"

export function processWorld(world: WorldState) {
	let activeCount = 0
	let inactiveCount = 0
	let totalCount = 0
	let stateSwitches = 0

	for (const generation of world) {
		for (let j = 0; j < world.length; j++) {
			const val = generation[j]

			if (typeof val !== "number") continue

			totalCount += 1
			if (val) activeCount += 1
			else inactiveCount += 1

			const prev = generation[j - 1]

			if (typeof prev === "number" && prev !== val) stateSwitches += 1
		}
	}

	return {
		activeRatio: activeCount / totalCount,
		inactiveRatio: inactiveCount / totalCount,
		movement: stateSwitches / totalCount,
	}
}
