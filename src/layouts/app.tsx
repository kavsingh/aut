import { A } from "@solidjs/router"

import Button, { buttonClassNames } from "#components/button"
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
			<div class="sticky top-0 flex items-center justify-end gap-1 px-8 pt-8">
				<A href="/" class={buttonClassNames()}>
					<ScrollsIcon />
				</A>
				<A href="/construct" class={buttonClassNames()}>
					<ConstructIcon />
				</A>
				<Button onClick={toggleFullscreen}>
					<FullscreenIcon />
				</Button>
				<a
					href="https://github.com/kavsingh/cellular-automaton"
					class={buttonClassNames()}
				>
					<GithubIcon />
				</a>
			</div>
			<div class="min-h-full w-full">{props.children}</div>
		</>
	)
}

function toggleFullscreen() {
	if (document.fullscreenElement) void document.exitFullscreen()
	else void document.documentElement.requestFullscreen()
}
