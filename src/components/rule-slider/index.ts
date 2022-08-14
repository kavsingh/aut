import { htmlToFragment } from '~/lib/dom'

// import RuleThumbnail from '../rule-thumbnail'

import type { Component } from '~/lib/types'

const RuleSlider: Component = () => {
	// const thumbnail = RuleThumbnail

	const el = htmlToFragment(/* html */ `
	<div>
		<div></div>
	</div>
	`)

	return { el }
}

export default RuleSlider
