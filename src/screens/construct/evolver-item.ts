import { container } from './evolver-item.module.css'

import type { Component } from '~/lib/types'

const EvolverItem: Component<{ initialPosition: number }> = ({
	initialPosition,
}) => {
	const el = document.createElement('div')

	el.classList.add(container)
	el.style.transform = `translateX${initialPosition}px`

	return { el }
}

export default EvolverItem
