import {
	container,
	thumbnailsContainer,
	worldCanvas,
	worldContainer,
} from './construct.module.css'

export const screen = /*html*/ `
	<div class=${container}>
		<div class=${worldContainer}>
			<div class=${thumbnailsContainer}></div>
			<canvas class=${worldCanvas}></canvas>
		</div>
	</div>
`
