'use strict'

// task 3 - memoize

export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || 128
    const policy = options.policy || 'lru'
    const ttl = options.ttl || null

    let cache = {}
    let lastUsed = {}
    let useCount = {}
    let createdAt = {}

    function isExpired(key) {
        if(!ttl) return false
        return Date.now() - createdAt[key] > ttl
    }
    
    function deleteKey(key) {
        delete cache[key]
        delete lastUsed[key]
        delete useCount[key]
        delete createdAt[key]
    }

    function evict() {
        const keys = Object.keys(cache)
        if(keys.length === 0) return

        let removeKey = keys[0]

        if(policy === 'lru') {
            for(let i = 1; i < keys.length; i++) {
                if(lastUsed[keys[i]] < lastUsed[removeKey]) {
                    removeKey = keys[i]
                }
            }
        } else if(policy === 'lfu') {
            for(let i = 1; i < keys.length; i++) {
                if(useCount[keys[i]] < useCount[removeKey]) {
                    removeKey = keys[i]
                }
            }
        }

        deleteKey(removeKey)
    }
