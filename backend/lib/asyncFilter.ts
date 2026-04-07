type Callback<T> = (err: Error | null, result: T) => void
type Predicate<T> = (item: T, callback: Callback<boolean>) => void
type SyncPredicate<T> = (item: T) => boolean

export function asyncFilterCallback<T>(
    array: T[],
    predicate: Predicate<T>,
    callback: Callback<T[]>
): void {
    if(!array || array.length == 0) {
        callback(null, [])
        return
    }
    
    let res: { item: T, i: number }[] = []
    let n = array.length
    let hasError = false

    array.forEach(function(item, i) {
        predicate(item, function(err, ok) {
            if(hasError) return

            if(err) {
                hasError = true
                callback(err, [])
                return
            }

            if(ok) {
                res.push({ item, i })
            }

            n--
            if(n == 0) {
                res.sort(function(a, b) { return a.i - b.i })
                callback(null, res.map(function(x) { return x.item }))
            }
        })
    })
}
