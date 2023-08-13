import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { ensureDir } from "fs-extra/esm"

import { PROJECT_ROOT } from "../lib/constants.js"
import { formatTypescriptContent } from "../lib/format/file-contents.js"

function readThemeCssFile() {
	return readFile(path.resolve(PROJECT_ROOT, "src/style/theme.css"), "utf-8")
}

async function writeThemeCssConstants(content: string) {
	const genDir = path.resolve(PROJECT_ROOT, "src/style/__generated__/")

	await ensureDir(genDir)

	return writeFile(path.join(genDir, "constants.ts"), content)
}

function extractCustomProperties(contents: string) {
	return Array.from(
		new Set(
			contents
				.match(/(?:^|\W)--([\w,-]+):/g)
				?.map((match) => match.trim().replace(/:$/, "")) ?? [],
		),
	)
}

function propToEnumMemberName(prop: string) {
	return prop
		.replace(/^--/, "")
		.split("-")
		.map(([first, ...rest]) => `${first?.toUpperCase() ?? ""}${rest.join("")}`)
		.join("")
}

function generateEnumMembers(props: string[]) {
	return props.map<[string, string]>((prop) => [
		propToEnumMemberName(prop),
		prop,
	])
}

function generateContents(name: string) {
	return function generateMembers(members: [string, string][]) {
		return formatTypescriptContent(
			`export enum ${name} {${members
				.map(([key, val]) => `${key} = "${val}",`)
				.join("\n")}}`,
		)
	}
}

void readThemeCssFile()
	.then(extractCustomProperties)
	.then(generateEnumMembers)
	.then(generateContents("CssThemeProp"))
	.then(writeThemeCssConstants)
