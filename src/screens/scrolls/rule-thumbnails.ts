import RuleThumbnail from "~/components/rule-thumbnail"
import { createEvolver } from "~/lib/evolver"

import type { EvolutionRule, WorldStateEvolver } from "~/lib/types"

export function addRuleThumbnails(
	rules: EvolutionRule[],
	container: HTMLElement,
	onThumbnailClick: (evolver: WorldStateEvolver) => void,
) {
	for (const rule of rules) {
		const evolver = createEvolver(rule)
		const { el } = RuleThumbnail({ fillColor: "#fff", evolver })

		container.appendChild(el)
		el.addEventListener("click", () => {
			onThumbnailClick(evolver)
		})
	}
}
