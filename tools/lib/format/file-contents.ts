import { format } from 'prettier'

import type { Options } from 'prettier'

const prettifier =
	(parser: NonNullable<Options['parser']>) => (content: string) =>
		format(content, { parser })

export const formatTypescriptContent = prettifier('typescript')

export const formatJsonContent = (content: unknown) =>
	prettifier('json')(JSON.stringify(content))
