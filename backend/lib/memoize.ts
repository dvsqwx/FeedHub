interface MemoizeOptions {
    maxSize?: number
    policy?: 'lru' | 'lfu'
    ttl?: number | null
}

type AnyFunction = (...args: unknown[]) => unknown

interface MemoizedFunction<T extends AnyFunction> {
    (...args: Parameters<T>): ReturnType<T>
    cacheSize(): number
    clearCache(): void
}

export function memoize<T extends AnyFunction>(fn: T, options: MemoizeOptions = {}): MemoizedFunction<T> {
    const maxSize = options.maxSize || 128
    const policy = options.policy || 'lru'
    const ttl = options.ttl || null

    let cache: Record<string, unknown> = {}
    let lastUsed: Record<string, number> = {}
    let useCount: Record<string, number> = {}
    let createdAt: Record<string, number> = {}

    function isExpired(key: string): boolean {
        if(!ttl) return false
        return Date.now() - createdAt[key] > ttl
    }

    function deleteKey(key: string): void {
        delete cache[key]
        delete lastUsed[key]
        delete useCount[key]
        delete createdAt[key]
    }

    function evict(): void {
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

    function memoized(...args: Parameters<T>): ReturnType<T> {
        const key = JSON.stringify(args)

        if(cache[key] && isExpired(key)) {
            deleteKey(key)
        }

        if(cache[key] !== undefined) {
            lastUsed[key] = Date.now()
            useCount[key]++
            return cache[key] as ReturnType<T>
        }

        if(Object.keys(cache).length >= maxSize) {
            evict()
        }

        const result = fn(...args) as ReturnType<T>

        cache[key] = result
        useCount[key] = 1
        lastUsed[key] = Date.now()
        createdAt[key] = Date.now()

        return result
    }

    memoized.cacheSize = function(): number {
        return Object.keys(cache).length
    }

    memoized.clearCache = function(): void {
        cache = {}
        lastUsed = {}
        useCount = {}
        createdAt = {}
    }

    return memoized as MemoizedFunction<T>
}
