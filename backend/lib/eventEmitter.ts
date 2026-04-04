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
}
