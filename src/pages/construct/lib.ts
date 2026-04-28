import { createEvolver } from "~/lib/evolver"
import { allRules } from "~/lib/rules"

import type { WorldStateEvolver } from "~/lib/types"

export const ALL_EVOLVERS: Readonly<Record<string, WorldStateEvolver>> =
	Object.fromEntries(
		Object.entries(allRules).map(([name, rule]) => [name, createEvolver(rule)]),
	)

export const EVOLVER_NAMES = Object.keys(ALL_EVOLVERS)
