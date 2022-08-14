import path from 'path'

import { readFile, ensureDir, writeFile } from 'fs-extra'

import { PROJECT_ROOT } from '../lib/constants'
import { formatTypescriptContent } from '../lib/format/file-contents'

const readThemeCssFile = () =>
	readFile(path.resolve(PROJECT_ROOT, 'src/style/theme.css'), 'utf-8')

const writeThemeCssConstants = async (content: string) => {
	const genDir = path.resolve(PROJECT_ROOT, 'src/style/__generated__/')

	await ensureDir(genDir)

	return writeFile(path.join(genDir, 'constants.ts'), content)
}

const extractCustomProperties = (contents: string) =>
	Array.from(
		new Set(
			contents
				.match(/(?:^|\W)--([\w,-]+):/g)
				?.map((match) => match.trim().replace(/:$/, '')) ?? [],
		),
	)

const propToEnumMemberName = (prop: string) =>
	prop
		.replace(/^--/, '')
		.split('-')
		.map(([first, ...rest]) => `${first?.toUpperCase() ?? ''}${rest.join('')}`)
		.join('')

const generateEnumMembers = (props: string[]) =>
	props.map<[string, string]>((prop) => [propToEnumMemberName(prop), prop])

const generateContents = (name: string) => (members: [string, string][]) =>
	formatTypescriptContent(
		`export enum ${name} {${members
			.map(([key, val]) => `${key} = "${val}",`)
			.join('\n')}}`,
	)

void readThemeCssFile()
	.then(extractCustomProperties)
	.then(generateEnumMembers)
	.then(generateContents('CssThemeProp'))
	.then(writeThemeCssConstants)
