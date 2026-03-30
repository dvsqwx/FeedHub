'use strict'

//task 5 async

export function asyncFilterCallback(array, predicate, callback) {
    if(!array || array.length == 0) {
        callback(null, [])
        return
    }
    let res = []
    let n = array.length

    array.forEach(function(item, i) {
        Promise.resolve(predicate(item)).then(function(ok) {
            if(ok) {
                res.push({item, i})
            }
        }).catch(function(e) {
            callback(e)
        }).finally(function() {
            n--
            if(n == 0) {
                res.sort(function(a,b) { return a.i - b.i })
                callback(null, res.map(function(x) { return x.item }))
            }
        })
    })
}

export function asyncFilterPromise(array, predicate) {
    return new Promise(function(resolve, reject) {
        let res = []
        let n = array.length

        if(array.length === 0) {
            resolve([])
            return
        }
        array.forEach(function(item, i) {
            Promise.resolve(predicate(item)).then(function(ok) {
                if(ok) res.push({item, i})
            }).catch(function(e) {
                reject(e)
            }).finally(function() {
                n--
                if(n == 0) {
                    res.sort(function(a,b) { return a.i - b.i })
                    resolve(res.map(function(x) { return x.item }))
                }
            })
        })
    })
}

export async function asyncFilter(array, predicate) {
    const results = await Promise.all(array.map(item => predicate(item)))
    const final = array.filter((item, i) => {
        return results[i]
    })
    return final
}

export const isHighPriority = item => item.priority >= 7

export const isMediumPriority = item => {
    if(item.priority >= 4 && item.priority < 7) {
        return true
    }
    return false
}

export const isTech = item => item.category === 'tech'
export const isCrypto = item => item.category === 'crypto'
export const isMemes = item => item.category === 'memes'
