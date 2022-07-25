import type { EvolutionRule, WorldState, WorldStateEvolver } from '~/lib/types'

export interface State {
	cellDim: number
	worldDim: number
	rules: EvolutionRule[]
	world: WorldState
	evolver: WorldStateEvolver | undefined
}
