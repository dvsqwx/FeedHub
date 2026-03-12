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

}
