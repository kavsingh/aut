import { centeredChildren } from '~/style/common-styles.module.css'

import {
	buttons,
	container,
	main,
	thumbnailsContainer,
	worlds,
} from './worlds-scrolls.module.css'

export const html = /* html */ `
	<div class="${container} ${centeredChildren}">
		<div class="${main}">
			<div class="${worlds} ${centeredChildren}"></div>
			<div class="${thumbnailsContainer} ${centeredChildren}"></div>
		</div>
		<div class="${buttons}"></div>
	</div>
`
