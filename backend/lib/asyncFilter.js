'use strict'

//task 5 async

export function asyncFilterCallback(array, predicate, callback) {
    let res = []
    let n = array.length
    if(!array || array.length == 0) {
        callback(null, [])
        return
    }
