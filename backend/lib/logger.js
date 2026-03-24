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
