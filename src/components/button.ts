import { twMerge } from "tailwind-merge"

import { htmlToElement } from "~/lib/dom"

import type { Component } from "~/lib/types"

const Button: Component<Props> = (props) => {
	const classNames = twMerge(
		"m-0 flex w-[1.1rem] flex-col items-center p-0 text-black opacity-30 transition-opacity hover:opacity-100 focus-visible:opacity-100 active:opacity-100 dark:text-white fs:opacity-10 [&>svg]:aspect-square [&>svg]:h-[unset] [&>svg]:w-full",
		props.class,
	)

	const el = htmlToElement(
		props.as === "link"
			? /* html */ `
				<a
					class="${classNames}"
					href=${props.href}
					target="_blank"
					rel="noopener"
					title="${props.label ?? props.href}"
					aria-label="${props.label ?? props.href}"
				>${props.content}</a>`
			: /* html */ `
				<button
					class="${classNames}"
					title="${props.label}"
					aria-label="${props.label}"
				>${props.content}</button>
			`,
	)

	if (props.as === "button") {
		el.addEventListener("click", () => {
			void props.onClick()
		})
	}

	return { el }
}

export default Button

type Props =
	| (PropsBase & { as: "button"; label: string; onClick: () => unknown })
	| (PropsBase & { as: "link"; href: string; label?: string })

type PropsBase = {
	content: string
	class?: string
}
