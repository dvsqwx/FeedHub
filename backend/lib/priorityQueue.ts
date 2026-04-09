interface QueueItem<T> {
    item: T
    priority: number
    count: number
}

type QueueMode = 'highest' | 'lowest' | 'oldest' | 'newest'

export class BiDirectionalPriorityQueue<T = unknown> {
    private items: QueueItem<T>[] = []
    private count: number = 0

    enqueue(item: T, priority: number = 0): void {
        const newItem: QueueItem<T> = {
            item,
            priority,
            count: this.count
        }
        this.items.push(newItem)
        this.count++
    }

    dequeue(mode: QueueMode = 'highest'): T | null {
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

    peek(mode: QueueMode = 'highest'): T | null {
        if(this.items.length == 0) return null

        let bestIndex = 0
        this.items.forEach((entry, i) => {
            if(mode == 'highest' && entry.priority > this.items[bestIndex].priority) bestIndex = i
            if(mode == 'lowest' && entry.priority < this.items[bestIndex].priority) bestIndex = i
            if(mode == 'oldest' && entry.count < this.items[bestIndex].count) bestIndex = i
            if(mode == 'newest' && entry.count > this.items[bestIndex].count) bestIndex = i
        })

        return this.items[bestIndex].item
    }

    size(): number {
        return this.items.length
    }

    isEmpty(): boolean {
        return this.items.length === 0
    }

    toArray(mode: QueueMode = 'highest'): T[] {
        const temp = new BiDirectionalPriorityQueue<T>()
        this.items.forEach(entry => temp.enqueue(entry.item, entry.priority))

        const result: T[] = []
        while(temp.items.length > 0) {
            result.push(temp.dequeue(mode) as T)
        }
        return result
    }
}
