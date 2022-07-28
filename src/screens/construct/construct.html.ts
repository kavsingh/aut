import {
	container,
	thumbnailsContainer,
	worldCanvas,
	worldContainer,
} from './construct.module.css'

export const screen = /*html*/ `
	<div class=${container}>
		<div class=${worldContainer}>
			<canvas class=${worldCanvas}></canvas>
			<div class=${thumbnailsContainer}></div>
		</div>
	</div>
`
