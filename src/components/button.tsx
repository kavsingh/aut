// https://ui.shadcn.com/docs/components/button

import { splitProps } from "solid-js"
import { twMerge } from "tailwind-merge"

import type { JSX } from "solid-js"

export default function Button(
	props: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "classList">,
) {
	const [localProps, passProps] = splitProps(props, ["class", "type"])

	return (
		<button
			{...passProps}
			type={localProps.type ?? "button"}
			class={buttonClassNames(localProps.class)}
		/>
	)
}

export function buttonClassNames(className?: string | undefined) {
	return twMerge(
		"m-0 flex w-[1.1rem] flex-col items-center p-0 text-black opacity-30 transition-opacity hover:opacity-100 focus-visible:opacity-100 active:opacity-100 fs:opacity-10 dark:text-white [&>svg]:aspect-square [&>svg]:h-[unset] [&>svg]:w-full",
		className,
	)
}
