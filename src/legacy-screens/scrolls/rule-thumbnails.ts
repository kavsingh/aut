import RuleThumbnail from "#legacy-components/rule-thumbnail"
import { createEvolver } from "#lib/evolver"

import type { EvolutionRule, WorldStateEvolver } from "#lib/types"

export function addRuleThumbnails(
	rules: EvolutionRule[],
	container: HTMLElement,
	onThumbnailClick: (evolver: WorldStateEvolver) => void,
) {
	rules.forEach((rule, index) => {
		const evolver = createEvolver(rule)
		const buttonEl = document.createElement("button")
		const { el } = RuleThumbnail({ evolver })

		buttonEl.setAttribute("aria-label", `Rule ${index + 1}`)
		buttonEl.appendChild(el)
		container.appendChild(buttonEl)
		buttonEl.addEventListener("click", () => {
			onThumbnailClick(evolver)
		})
	})
}
