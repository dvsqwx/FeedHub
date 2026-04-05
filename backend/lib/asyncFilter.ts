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
