export const range = max => (new Array(max)).fill(0).map((v, i) => i)

export const mod = (n, m) => ((n % m) + m) % m

export const sample = arr => arr[Math.floor(Math.random() * arr.length)]

export const last = arr => arr[arr.length - 1]

export const head = arr => arr[0]

export const take = n => arr => n < 0 ? arr.slice(n) : arr.slice(0, n)

export const seedSingle = len => {
    if (!len) return []
    const lr = range(Math.floor(len / 2)).map(_ => 0)

    if (len % 2 === 0) return lr.slice(0, -1).concat(1).concat(lr)
    return lr.concat(1).concat(lr)
}

export const seedRandom = len =>
    range(len).map(_ => Math.floor(Math.random() * 2))

export const pipe = (...fns) => (...firstArgs) => {
    const [first, ...rest] = fns
    return rest.reduce((result, fn) => fn(result), first(...firstArgs))
}

export const adjacentByIndex = val => arr => {
    const groups = []

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== val) continue
        const currentGroup = last(groups)
        if (currentGroup && last(currentGroup) === i - 1) currentGroup.push(i)
        else groups.push([i])
    }

    return groups
}