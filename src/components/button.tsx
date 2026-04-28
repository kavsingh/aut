// https://ui.shadcn.com/docs/components/button

import { splitProps } from "solid-js"

import { tv } from "~/lib/style"

import type { ComponentProps } from "solid-js"

export const buttonVariants = tv({
	base: "m-0 flex flex-col items-center p-0 text-black opacity-30 transition-opacity inline-[1.1rem] hover:opacity-100 focus-visible:opacity-100 active:opacity-100 dark:text-white fs:opacity-10 [&>svg]:aspect-square [&>svg]:block-[unset] [&>svg]:inline-full",
})

export function Button(props: Omit<ComponentProps<"button">, "classList">) {
	const [localProps, passProps] = splitProps(props, ["class", "type"])

	return (
		<button
			{...passProps}
			type={localProps.type ?? "button"}
			class={buttonVariants(localProps.class)}
		/>
	)
}
