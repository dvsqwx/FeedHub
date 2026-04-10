import fs from 'fs'

type LogLevel = 'debug' | 'info' | 'call' | 'error'
type LogFormat = 'text' | 'json'

interface LoggerOptions {
    format?: LogFormat
    level?: LogLevel
    filepath?: string
}

interface Logger {
    debug(msg: string, meta?: Record<string, unknown>): void
    info(msg: string, meta?: Record<string, unknown>): void
    call(msg: string, meta?: Record<string, unknown>): void
    error(msg: string, meta?: Record<string, unknown>): void
    _log(level: LogLevel, msg: string, meta?: Record<string, unknown>): void
    _fmt(level: LogLevel, msg: string, meta?: Record<string, unknown>): string
}

const LEVELS: LogLevel[] = ['debug', 'info', 'call', 'error']

function formatText(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const time = new Date().toISOString()
    let out = `[${time}] [${level}] ${message}`
    if(meta) out += ' ' + JSON.stringify(meta)
    return out
}

function formatJson(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const obj = {
        time: new Date().toISOString(),
        level,
        message,
        ...(meta || {})
    }
    return JSON.stringify(obj)
}

export function createLogger(options: LoggerOptions = {}): Logger {
    const fmt = options.format == 'json' ? formatJson : formatText
    const minLevel: LogLevel = options.level || 'debug'
    const minIndex = LEVELS.indexOf(minLevel)

    function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        const idx = LEVELS.indexOf(level)
        if(idx === -1) return
        if(idx < minIndex) return
        const line = fmt(level, message, meta)
        console.log(line)
    }

    return {
        debug: (msg, meta) => log('debug', msg, meta),
        info: (msg, meta) => log('info', msg, meta),
        call: (msg, meta) => log('call', msg, meta),
        error: (msg, meta) => log('error', msg, meta),
        _log: log,
        _fmt: fmt
    }
}

export function withLogging<T extends (...args: unknown[]) => unknown>(
    fn: T,
    logger: Logger,
    name?: string
): T {
    const fnName = name || fn.name || 'anonymous'

    return function(...args: unknown[]) {
        const start = Date.now()
        logger.call(`${fnName} called`, { args })

        try {
            const result = fn(...args)
            const ms = Date.now() - start
            logger.info(`${fnName} done`, { ms, result })
            return result
        } catch(e) {
            logger.error(`${fnName} threw`, { error: (e as Error).message })
            throw e
        }
    } as T
}

export function withLoggingAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    logger: Logger,
    name?: string
): T {
    const fnName = name || fn.name || 'anonymous'

    return async function(...args: unknown[]) {
        const start = Date.now()
        logger.call(`${fnName} called`, { args })

        try {
            const result = await fn(...args)
            const ms = Date.now() - start
            logger.info(`${fnName} done`, { ms, result })
            return result
        } catch(e) {
            logger.error(`${fnName} threw`, { error: (e as Error).message })
            throw e
        }
    } as T
}

export function createFileLogger(options: LoggerOptions = {}): Logger {
    const filepath = options.filepath || 'logs/app.log'
    const base = createLogger(options)
    const originalLog = base._log.bind(base)

    fs.mkdirSync('logs', { recursive: true })

    base._log = function(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        originalLog(level, message, meta)
        const line = base._fmt(level, message, meta)
        fs.appendFile(filepath, line + '\n', (err: NodeJS.ErrnoException | null) => {
            if(err) console.error('couldnt write to log:', err.message)
        })
    }

    return base
}
