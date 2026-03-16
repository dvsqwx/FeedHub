'use strict'

// Task 4 - Bi-Directional Priority Queue

export class BiDirectionalPriorityQueue {

    constructor() {
        this.items = []
        this.counter = 0
    }

    enqueue(item, priority = 0) {
        this.items.push({
            item,
            priority,
            order: this.counter,
        })
        this.counter++
    }

    dequeue(mode = 'highest') {
        if (this.items.length === 0) return null

        const index = this._findIndex(mode)
        const entry = this.items[index]

        this.items.splice(index, 1)

        return entry.item
    }

    peek(mode = 'highest') {
        if (this.items.length === 0) return null

        const index = this._findIndex(mode)
        return this.items[index].item
    }

    _findIndex(mode) {
        let bestIndex = 0

        this.items.forEach((entry, i) => {
            const best = this.items[bestIndex]

            if (mode === 'highest' && entry.priority > best.priority) bestIndex = i
            if (mode === 'lowest'  && entry.priority < best.priority) bestIndex = i
            if (mode === 'oldest'  && entry.order < best.order)       bestIndex = i
            if (mode === 'newest'  && entry.order > best.order)       bestIndex = i
        })

        return bestIndex
    }

}
