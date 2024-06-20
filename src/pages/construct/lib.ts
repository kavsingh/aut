import { createEvolver } from "#lib/evolver"
import * as rules from "#lib/rules"

import type { WorldStateEvolver } from "#lib/types"

export const ALL_EVOLVERS: Readonly<Record<string, WorldStateEvolver>> =
	Object.fromEntries(
		Object.entries(rules).map(([name, rule]) => [name, createEvolver(rule)]),
	)

export const EVOLVER_NAMES = Object.keys(ALL_EVOLVERS)
