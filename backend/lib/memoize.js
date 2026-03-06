'use strict'

// Task 3 - memoization function

export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || 128
    const policy = options.policy || 'lru'
    const ttl = options.ttl || null

    const cache = {}

    function memoized(...args) {
        const key = JSON.stringify(args)

        if (cache[key]) {
            cache[key].lastUsed = Date.now()
            cache[key].useCount++
            return cache[key].result
        }

        const result = fn(...args)

        cache[key] = {
            result,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            useCount: 1,
        }

        return result
    }

    memoized.cacheSize = () => Object.keys(cache).length
    memoized.clearCache = () => Object.keys(cache).forEach(k => delete cache[k])

    return memoized
}
