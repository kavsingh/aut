// adapted from https://github.com/molefrog/wouter/blob/master/use-location.js

export function createRouter(onRoute: (route: string) => unknown, base = "") {
	let hash = createHash(currentPathname(base), location.search)

	function handleHistoryEvent() {
		const nextHash = createHash(currentPathname(base), location.search)

		if (nextHash !== hash) {
			hash = nextHash
			onRoute(hash)
		}
	}

	patchHistoryFn("pushState")
	patchHistoryFn("replaceState")
	addEventListener("pushState", handleHistoryEvent)
	addEventListener("replaceState", handleHistoryEvent)
	addEventListener("popstate", handleHistoryEvent)

	function navigate(
		to: string,
		{ replace = false }: { replace?: boolean } = {},
	) {
		history[replace ? "replaceState" : "pushState"](
			null,
			"",
			// handle nested routers and absolute paths
			to.startsWith("~") ? to.slice(1) : `${base}${to}`,
		)
	}

	onRoute(hash)

	return { navigate } as const
}

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
function patchHistoryFn<K extends HistoryStateFnKey>(key: K) {
	const original = history[key]

	history[key] = function (...args: Parameters<History[K]>) {
		const event: Event & { arguments?: unknown[] } = new Event(key)

		event.arguments = args

		original.apply(this, args)
		dispatchEvent(event)
	}
}

function createHash(pathname: string, search: string) {
	return `${pathname}${search}`
}

function currentPathname(base: string, path = location.pathname) {
	return path.toLowerCase().startsWith(base.toLowerCase())
		? path.slice(base.length) || "/"
		: `~${path}`
}

type HistoryStateFnKey = keyof History & `${string}State`
