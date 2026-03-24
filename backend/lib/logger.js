'use strict'

// task 9 - logger

import fs from 'fs'
import path from 'path'

const LEVELS = ['debug', 'info', 'call', 'error']

function formatText(level, message, meta) {
    const time = new Date().toISOString()
    let out = `[${time}] [${level}] ${message}`
    if(meta) out += ' ' + JSON.stringify(meta)
    return out
}

function formatJson(level, message, meta) {
    const obj = {
        time: new Date().toISOString(),
        level,
        message,
        ...meta
    }
    return JSON.stringify(obj)
}
export function createLogger(options = {}) {
    const fmt = options.format == 'json' ? formatJson : formatText
    const minLevel = options.level || 'debug'
    const minIndex = LEVELS.indexOf(minLevel)

    function log(level, message, meta) {
        if(LEVELS.indexOf(level) < minIndex) return
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
