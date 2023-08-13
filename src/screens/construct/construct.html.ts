import {
	buttons,
	container,
	slidersContainer,
	worldCanvas,
	worldContainer,
} from "./construct.module.css"

export const screen = /*html*/ `
	<div class=${container}>
		<div class=${worldContainer}>
			<div class=${slidersContainer}></div>
			<canvas class=${worldCanvas}></canvas>
		</div>
	</div>
	<div class="${buttons}"></div>
`
