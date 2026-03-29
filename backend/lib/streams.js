'use strict'

// task6

export async function* streamFromArray(arr) {
    for (const item of arr) {
        yield await item
    }
}

export async function* streamJsonlFile(filepath) {
    const fs = await import('fs')
    const readline = await import('readline')

    const fileStream = fs.createReadStream(filepath)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    for await (const line of rl) {
        if(line.trim() === '') continue
        try {
            yield JSON.parse(line)
        } catch(e) {
            console.error('bad line:', line)
        }
    }
}

export async function* streamFilter(stream, predicate) {
    for await (const item of stream) {
        const result = predicate(item)
        if(result == true) {
            yield await item
        }
    }
}
export async function* streamMap(stream, transform) {
    for await (const item of stream) {
        let mapped = await transform(item)
        yield mapped
    }
}

export async function* streamTake(stream, n) {
    let count = 0
    for await (const item of stream) {
        if(count >= n) break
        yield item
        count++
    }
}
