'use strict';

//task 4 bi directional queue

export class BiDirectionalPriorityQueue {
    constructor() {
        this.items = []
        this.count = 0
    }

    enqueue(item, priority = 0) {
        const newItem = {
            item,
            priority,
            count: this.count
        }
        this.items.push(newItem)
        this.count++
    }

    dequeue(mode = 'highest') {
        if(this.items.length == 0) return null

        let bestIndex = 0
        this.items.forEach((entry, i) => {
            if(mode == 'highest' && entry.priority > this.items[bestIndex].priority) bestIndex = i
            if(mode == 'lowest' && entry.priority < this.items[bestIndex].priority) bestIndex = i
            if(mode == 'oldest' && entry.count < this.items[bestIndex].count) bestIndex = i
            if(mode == 'newest' && entry.count > this.items[bestIndex].count) bestIndex = i
        })

        const found = this.items[bestIndex]
        this.items.splice(bestIndex, 1)
        return found.item
    }
