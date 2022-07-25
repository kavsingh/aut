export type WorldState = number[][]
export type WorldStateEvolver = (world: WorldState) => WorldState
export type EvolutionRule = (a: number, b: number, c: number) => 0 | 1

export type ComponentProps<P> = P & Record<never, never>

export type ComponentReturn = { el: HTMLElement | DocumentFragment }

export type Component<P = Record<string, unknown>> = (
	props: ComponentProps<P>,
) => ComponentReturn
