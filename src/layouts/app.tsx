import { A } from "@solidjs/router"

import { Button, buttonVariants } from "~/components/button"
import {
	ConstructIcon,
	FullscreenIcon,
	GithubIcon,
	RocketIcon,
	ScrollsIcon,
	TransparencyGridIcon,
} from "~/components/icons"
import { tv } from "~/lib/style"

import type { ComponentProps, ParentProps } from "solid-js"

const internalLinkVariants = tv({
	extend: buttonVariants,
	base: "aria-[current=page]:opacity-60",
})

function InternalLink(
	props: Omit<
		ComponentProps<typeof A>,
		"class" | "classList" | "activeClass" | "inactiveClass"
	>,
) {
	return <A {...props} class={internalLinkVariants()} />
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
				<InternalLink href="/wgpu-scrolls">
					<RocketIcon />
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
