export type WorldState = number[][]
export type WorldStateEvolver = (world: WorldState) => WorldState
export type EvolutionRule = (a: number, b: number, c: number) => 0 | 1
