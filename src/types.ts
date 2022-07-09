export type WorldState = number[][]
export type WorldStateEvolver = (world: WorldState) => WorldState
export type EvolutionRule = (a: number, b: number, c: number) => 0 | 1

export interface State {
	cellDim: number
	worldDim: number
	rules: EvolutionRule[]
	world: WorldState
	evolver: WorldStateEvolver | undefined
}
