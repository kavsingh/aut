// https://ui.shadcn.com/docs/components/button

import { splitProps } from "solid-js"
import { tv } from "tailwind-variants"

import type { ComponentProps } from "solid-js"

export default function Button(
	props: Omit<ComponentProps<"button">, "classList">,
) {
	const [localProps, passProps] = splitProps(props, ["class", "type"])

	return (
		<button
			{...passProps}
			type={localProps.type ?? "button"}
			class={buttonVariants(localProps.class)}
		/>
	)
}

export const buttonVariants = tv({
	base: "fs:opacity-10 m-0 flex w-[1.1rem] flex-col items-center p-0 text-black opacity-30 transition-opacity hover:opacity-100 focus-visible:opacity-100 active:opacity-100 dark:text-white [&>svg]:aspect-square [&>svg]:h-[unset] [&>svg]:w-full",
})
