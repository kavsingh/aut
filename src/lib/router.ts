// adapted from https://github.com/molefrog/wouter/blob/master/use-location.js

export const createRouter = (base = '') => {
	let hash = createHash(currentPathname(base), location.search)

	const handleHistoryEvent = () => {
		const nextHash = createHash(currentPathname(base), location.search)

		if (nextHash !== hash) {
			hash = nextHash
		}
	}

	patchHistoryFn('pushState')
	patchHistoryFn('replaceState')
	addEventListener('pushState', handleHistoryEvent)
	addEventListener('replaceState', handleHistoryEvent)
	addEventListener('popstate', handleHistoryEvent)

	const navigate = (
		to: string,
		{ replace = false }: { replace?: boolean } = {},
	) =>
		history[replace ? 'replaceState' : 'pushState'](
			null,
			'',
			// handle nested routers and absolute paths
			to.startsWith('~') ? to.slice(1) : `${base}${to}`,
		)

	return { navigate } as const
}

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
const patchHistoryFn = <K extends HistoryStateFnKey>(key: K) => {
	const original = history[key]

	history[key] = function (...args: Parameters<History[K]>) {
		const result = original.apply(this, args)
		const event: Event & { arguments?: unknown[] } = new Event(key)
		event.arguments = args

		dispatchEvent(event)
		return result
	}
}

const createHash = (pathname: string, search: string) => `${pathname}${search}`

const currentPathname = (base: string, path = location.pathname) =>
	path.toLowerCase().startsWith(base.toLowerCase())
		? path.slice(base.length) || '/'
		: `~${path}`

type HistoryStateFnKey = keyof History & `${string}State`
