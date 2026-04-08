export const EVENTS = {
    ARTICLE: 'article',
    ERROR: 'error',
    PAUSE: 'pause',
    RESUME: 'resume',
    CLEAR: 'clear',
} as const

type Listener = (data: unknown) => void

export class EventEmitter {

    private listeners: Record<string, Listener[]> = {}

    subscribe(event: string, fn: Listener): this {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        this.listeners[event].push(fn)
        return this
    }
    unsubscribe(event: string, fn: Listener): this {
        if (!this.listeners[event]) return this

        this.listeners[event] = this.listeners[event].filter(l => l !== fn)

        if (this.listeners[event].length == 0) {
            delete this.listeners[event]
        }

        return this
    }
    emit(event: string, data?: unknown): this {
        if (!this.listeners[event]) return this
        this.listeners[event].forEach(fn => fn(data))
        return this
    }
    once(event: string, fn: Listener): this {
        const wrapper = (data: unknown) => {
            fn(data)
            this.unsubscribe(event, wrapper)
        }
        return this.subscribe(event, wrapper)
    }

    on(event: string, fn: Listener): this {
        return this.subscribe(event, fn)
    }

    emitSafe(event: string, data?: unknown): this {
        if (event === EVENTS.ERROR && !this.listeners[EVENTS.ERROR]) {
            throw data instanceof Error ? data : new Error(String(data))
        }
        return this.emit(event, data)
    }

}

let instance: EventEmitter | null = null

export function getEmitter(): EventEmitter {
    if (!instance) {
        instance = new EventEmitter()
    }
    return instance
}
