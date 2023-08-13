import { htmlToElement } from "~/lib/dom"
import { isTruthy } from "~/lib/util"

import { container } from "./button.module.css"

import type { Component } from "~/lib/types"

const Button: Component<Props> = (props) => {
	const classNames = [container, props.class].filter(isTruthy).join(" ")
	const el = htmlToElement(
		props.as === "link"
			? /* html */ `
		<a
			class="${classNames}
			href=${props.href}
			target="_blank"
			rel="noopener"
		>${props.content}</a>`
			: /* html */ `
		<button class="${classNames}">${props.content}</button>`,
	)

	if (props.as === "button") {
		el.addEventListener("click", () => {
			void props.onClick()
		})
	}

	return { el }
}

export default Button

type Props = ButtonProps | LinkProps

type ButtonProps = PropsBase & {
	as: "button"
	onClick: () => unknown
}

type LinkProps = PropsBase & {
	as: "link"
	href: string
}

type PropsBase = {
	content: string
	class?: string
}
