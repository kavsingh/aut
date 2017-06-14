export const curry = fn => (...args) =>
    (args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args)))

export const eq = curry((c, a) => c === a)

export const range = max => Array.from({ length: max }, (_, i) => i)

export const mathMod = curry((m, n) => ((n % m) + m) % m)

export const sample = arr => arr[Math.floor(Math.random() * arr.length)]

export const last = arr => arr[arr.length - 1]

export const head = arr => arr[0]

export const take = curry((n, arr) => n < 0 ? arr.slice(n) : arr.slice(0, n))

export const constant = val => () => val

export const seedSingle = len => {
    if (!len) return []
    const lr = range(Math.floor(len / 2)).map(() => 0)

    if (len % 2 === 0) return lr.slice(0, -1).concat(1).concat(lr)
    return lr.concat(1).concat(lr)
}

export const seedRandom = len =>
    range(len).map(() => Math.floor(Math.random() * 2))

export const pipe = (...fns) => (...firstArgs) => {
    const [firstFn, ...rest] = fns
    return rest.reduce((result, fn) => fn(result), firstFn(...firstArgs))
}

export const takeIndexWhile = curry((predicate, arr) => {
    const result = []

    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) result.push(i)
        else if (result.length) break
    }

    return result
})

export const groupIndecesBy = curry((predicate, arr) => {
    const groups = []

    for (let i = 0; i < arr.length; i++) {
        if (!predicate(arr[i])) continue
        const currentGroup = last(groups)
        if (currentGroup && last(currentGroup) === i - 1) currentGroup.push(i)
        else groups.push([i])
    }

    return groups
})

export const flatten = arr =>
    arr.reduce((flat, val) => flat.concat(val), [])
