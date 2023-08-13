import RuleThumbnail from "~/components/rule-thumbnail"
import { getThemeValue } from "~/lib/css"
import { createEvolver } from "~/lib/evolver"

import type { EvolutionRule, WorldStateEvolver } from "~/lib/types"

export function addRuleThumbnails(
	rules: EvolutionRule[],
	container: HTMLElement,
	onThumbnailClick: (evolver: WorldStateEvolver) => void,
) {
	const fillColor = getThemeValue("--color-line-600")

	for (const rule of rules) {
		const evolver = createEvolver(rule)
		const { el } = RuleThumbnail({ fillColor, evolver })

		container.appendChild(el)
		el.addEventListener("click", () => {
			onThumbnailClick(evolver)
		})
	}
}
