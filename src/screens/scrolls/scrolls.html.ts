import {
	buttons,
	container,
	main,
	thumbnailsContainer,
	worlds,
} from './scrolls.module.css'

export const html = /* html */ `
	<div class="${container}">
		<div class="${main}">
			<div class="${worlds}"></div>
			<div class="${thumbnailsContainer}"></div>
		</div>
		<div class="${buttons}"></div>
	</div>
`
