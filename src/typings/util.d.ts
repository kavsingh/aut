// https://github.com/microsoft/TypeScript/issues/13923#issuecomment-653675557
// prettier-ignore
declare type Immutable<T> =
	// oxlint-disable-next-line eslint/ban-types, typescript/no-unsafe-function-type
	T extends Function | boolean | number | string | null | undefined ? T :
	T extends Map<infer K, infer V> ? ReadonlyMap<Immutable<K>, Immutable<V>> :
	T extends Set<infer S> ? ReadonlySet<Immutable<S>> :
	{readonly [P in keyof T]: Immutable<T[P]>}

type UnwrapArrayLike<T> = T extends ArrayLike<infer U> ? U : T

type AsyncReturn<T> = Immutable<Awaited<ReturnType<T>>>
