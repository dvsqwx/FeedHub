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

function onArticle(article) {
    if(state.paused) return

    state.articles.unshift(article)
    state.stats.total++
    state.stats.shown++

    if(article.priority >= 7) state.stats.high++

    state.cats[article.category] = (state.cats[article.category] || 0) + 1
    state.queue.enqueue(article, article.priority)
    state.emitter.emit(EVENTS.ARTICLE, article)
}

async function startFeed() {
    const gen = newsFeedGenerator(2000)
    for await (const article of gen) {
        onArticle(article)
    }
}

function getPriorityClass(priority) {
    if(priority >= 7) return 'high'
    if(priority >= 4) return 'medium'
    return 'low'
}

function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if(mins < 1) return 'just now'
    if(mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    return `${hrs}h ago`
}
