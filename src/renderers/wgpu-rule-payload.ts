const RULE_IDS = [
	"rule3",
	"rule18",
	"rule45",
	"rule57",
	"rule73",
	"rule90",
	"rule160",
	"rule182",
	"rule225",
] as const

type RuleId = (typeof RULE_IDS)[number]
type RuleStop = readonly [ruleId: RuleId, transitionRatio: number]

function createRuleLookups(): Readonly<Record<RuleId, Uint32Array>> {
	const lookups = {
		rule3: new Uint32Array(8),
		rule18: new Uint32Array(8),
		rule45: new Uint32Array(8),
		rule57: new Uint32Array(8),
		rule73: new Uint32Array(8),
		rule90: new Uint32Array(8),
		rule160: new Uint32Array(8),
		rule182: new Uint32Array(8),
		rule225: new Uint32Array(8),
	} satisfies Record<RuleId, Uint32Array>

	for (const ruleId of RULE_IDS) {
		const ruleNumber = Number(ruleId.replace("rule", ""))

		for (let pattern = 0; pattern < 8; pattern++) {
			lookups[ruleId][pattern] = Math.floor(ruleNumber / 2 ** pattern) % 2
		}
	}

	return lookups
}

const RULE_LOOKUPS = createRuleLookups()
const RULE_ID_SET = new Set<string>(RULE_IDS)

function isRuleId(value: string): value is RuleId {
	return RULE_ID_SET.has(value)
}

interface WriteWorldRuleStopsArgs {
	worldIndex: number
	stops: readonly RuleStop[]
	ruleLookups: Uint32Array
	transitionRatios: Float32Array
	ruleCounts: Uint32Array
	stopCap: number
	lookupWidth: number
}

function writeWorldRuleStops(args: WriteWorldRuleStopsArgs) {
	const {
		worldIndex,
		stops,
		ruleLookups,
		transitionRatios,
		ruleCounts,
		stopCap,
		lookupWidth,
	} = args
	const worldStopBase = worldIndex * stopCap
	const stopCount = Math.min(stops.length, stopCap)

	ruleCounts[worldIndex] = stopCount

	for (let stopIndex = 0; stopIndex < stopCount; stopIndex++) {
		const currentStop = stops[stopIndex]
		if (!currentStop) continue

		const [ruleId, ratio] = currentStop
		const ruleOffset = (worldStopBase + stopIndex) * lookupWidth

		ruleLookups.set(RULE_LOOKUPS[ruleId], ruleOffset)
		transitionRatios[worldStopBase + stopIndex] = ratio
	}
}

export { RULE_IDS, isRuleId, writeWorldRuleStops }
export type { RuleId, RuleStop }
