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
