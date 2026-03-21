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
