import { A } from "@solidjs/router"

import Button, { buttonVariants } from "#components/button"
import {
	ConstructIcon,
	FullscreenIcon,
	GithubIcon,
	ScrollsIcon,
} from "#components/icons"

import type { ParentProps } from "solid-js"

export default function App(props: ParentProps) {
	return (
		<>
			<div class="fixed z-10 flex w-full items-center justify-end gap-1 px-8 pt-8">
				<A href="/" class={buttonVariants()}>
					<ScrollsIcon />
				</A>
				<A href="/construct" class={buttonVariants()}>
					<ConstructIcon />
				</A>
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

function toggleFullscreen() {
	if (document.fullscreenElement) void document.exitFullscreen()
	else void document.documentElement.requestFullscreen()
}
