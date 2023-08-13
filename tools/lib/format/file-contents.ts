import { pipe } from "@kavsingh/curry-pipe"
import { format } from "prettier"

import type { Options } from "prettier"

export const formatTypescriptContent = prettifier("typescript")

export const formatJsonContent = pipe(JSON.stringify, prettifier("json"))

function prettifier(parser: NonNullable<Options["parser"]>) {
	return function prettify(content: string) {
		return format(content, { parser })
	}
}
