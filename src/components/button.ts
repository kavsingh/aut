import { twMerge } from "tailwind-merge"

import { htmlToElement } from "~/lib/dom"

import type { Component } from "~/lib/types"

const Button: Component<Props> = (props) => {
	const classNames = twMerge(
		"w-[1.3em] text-black opacity-30 transition-opacity hover:opacity-100 focus-visible:opacity-100 active:opacity-100 dark:text-white fs:opacity-10 [&>svg]:aspect-square [&>svg]:h-[unset] [&>svg]:w-full",
		props.class,
	)

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
