import { A } from "@solidjs/router"

import Button, { buttonVariants } from "#components/button"
import {
	ConstructIcon,
	FullscreenIcon,
	GithubIcon,
	RocketIcon,
	ScrollsIcon,
} from "#components/icons"
import { tv } from "#lib/style"

import type { ComponentProps, ParentProps } from "solid-js"

export default function App(props: ParentProps) {
	return (
		<>
			<div class="fixed z-10 flex w-full items-center justify-end gap-1 px-8 pt-8">
				<InternalLink href="/">
					<ScrollsIcon />
				</InternalLink>
				<InternalLink href="/gpu">
					<RocketIcon />
				</InternalLink>
				<InternalLink href="/construct">
					<ConstructIcon />
				</InternalLink>
				<Button onClick={toggleFullscreen}>
					<FullscreenIcon />
				</Button>
				<a
					href="https://github.com/kavsingh/cellular-automaton"
					class={buttonVariants()}
				>
					<GithubIcon />
				</a>
			</div>
			<div class="size-full">{props.children}</div>
		</>
	)
}

function InternalLink(
	props: Omit<
		ComponentProps<typeof A>,
		"class" | "classList" | "activeClass" | "inactiveClass"
	>,
) {
	return <A {...props} class={internalLinkVariants()} />
}

const internalLinkVariants = tv({
	extend: buttonVariants,
	base: "aria-[current=page]:opacity-60",
})

function toggleFullscreen() {
	if (document.fullscreenElement) void document.exitFullscreen()
	else void document.documentElement.requestFullscreen()
}
