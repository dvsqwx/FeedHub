'use strict'

// Task 3 - memoization function

export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || 128
    const policy = options.policy || 'lru'
    const ttl = options.ttl || null

    // cache stores
    const cache = {}

    function removeExpired() {
        if (!ttl) return

        const now = Date.now()
        const expiredKeys = Object.keys(cache).filter(key => now - cache[key].createdAt > ttl)
        expiredKeys.forEach(key => delete cache[key])
    }

    function evictOne() {
        const keys = Object.keys(cache)
        if (keys.length === 0) return

        let keyToRemove = keys[0]

        if (policy === 'lru') {
            keyToRemove = keys.reduce((oldest, key) =>
                    cache[key].lastUsed < cache[oldest].lastUsed ? key : oldest
                , keys[0])

        } else if (policy === 'lfu') {
            keyToRemove = keys.reduce((least, key) =>
                    cache[key].useCount < cache[least].useCount ? key : least
                , keys[0])

        } else if (policy === 'ttl') {
            // remove the oldest entry by creation time
            keyToRemove = keys.reduce((oldest, key) =>
                    cache[key].createdAt < cache[oldest].createdAt ? key : oldest
                , keys[0])

        } else if (policy === 'custom' && options.customEvict) {
            keyToRemove = options.customEvict(cache)
        }

        delete cache[keyToRemove]
    }

    function memoized(...args) {
        removeExpired()

        const key = JSON.stringify(args)

        // cache hit
        if (cache[key]) {
            cache[key].lastUsed = Date.now()
            cache[key].useCount++
            return cache[key].result
        }

        // cache miss
        if (Object.keys(cache).length >= maxSize) {
            evictOne()
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
