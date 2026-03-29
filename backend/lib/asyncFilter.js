'use strict'

//task 5 async

export function asyncFilterCallback(array, predicate, callback) {
    let res = []
    let n = array.length
    if(!array || array.length == 0) {
        callback(null, [])
        return
    }

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
