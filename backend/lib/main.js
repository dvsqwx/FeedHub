'use strict'

import { newsFeedGenerator } from '../backend/lib/generator.js'
import { BiDirectionalPriorityQueue } from '../backend/lib/priorityQueue.js'
import { memoize } from '../backend/lib/memoize.js'
import { EVENTS, getEmitter } from '../backend/lib/eventEmitter.js'

const state = {
    articles: [],
    paused: false,
    queue: new BiDirectionalPriorityQueue(),
    emitter: getEmitter(),
    stats: {
        total: 0,
        shown: 0,
        high: 0,
    },
    cats: { tech: 0, crypto: 0, memes: 0 },
}

const getCatCount = memoize((cat) => {
    return state.articles.filter(a => a.category === cat).length
})
