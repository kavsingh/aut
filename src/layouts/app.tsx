import { A } from "@solidjs/router"
import { splitProps } from "solid-js"

import { Button, buttonVariants } from "~/components/button"
import {
	ConstructIcon,
	FullscreenIcon,
	GithubIcon,
	ScrollsIcon,
	TransparencyGridIcon,
} from "~/components/icons"
import { tv, tm } from "~/lib/style"

import type { ComponentProps, ParentProps } from "solid-js"

const internalLinkVariants = tv({
	extend: buttonVariants,
	base: "aria-[current=page]:opacity-60",
})

function InternalLink(
	props: Omit<
		ComponentProps<typeof A>,
		"classList" | "activeClass" | "inactiveClass"
	>,
) {
	const [compProps, passProps] = splitProps(props, ["class"])

	return (
		<A {...passProps} class={tm(compProps.class, internalLinkVariants())} />
	)
}

function toggleFullscreen() {
	if (document.fullscreenElement) void document.exitFullscreen()
	else void document.documentElement.requestFullscreen()
}

export function App(props: ParentProps) {
	return (
		<>
			<div class="fixed z-10 flex items-center justify-end gap-1 px-8 pbs-8 inline-full">
				<InternalLink href="/">
					<ScrollsIcon />
				</InternalLink>
				<InternalLink href="/construct">
					<ConstructIcon />
				</InternalLink>
				<InternalLink class="text-green-600" href="/wgpu-scrolls">
					<ScrollsIcon />
				</InternalLink>
				<InternalLink class="text-green-600" href="/wgpu-construct">
					<ConstructIcon />
				</InternalLink>
				<Button onClick={toggleFullscreen}>
					<FullscreenIcon />
				</Button>
				<InternalLink href="/wgpu-gol">
					<TransparencyGridIcon />
				</InternalLink>
				<a
					href="https://github.com/kavsingh/cellular-automaton"
					class={buttonVariants()}
				>
					<GithubIcon />
				</a>
			</div>
			<div class="block-full inline-full">{props.children}</div>
		</>
	)
}
