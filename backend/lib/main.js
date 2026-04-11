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

function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if(mins < 1) return 'just now'
    if(mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    return `${hrs}h ago`
}

function renderCard(article) {
    const list = document.getElementById('articles-list')
    if(!list) return

    const empty = list.querySelector('.empty-state')
    if(empty) empty.remove()

    const cls = getPriorityClass(article.priority)

    const card = document.createElement('div')
    card.className = `article-card ${cls}`
    card.dataset.id = article.id
    card.dataset.category = article.category
    card.dataset.priority = article.priority

    card.innerHTML = `
        <div class="article-body">
            <div class="article-title">${article.title}</div>
            <div class="article-meta">
                <span class="tag tag-${article.category}">${article.category}</span>
                <span class="article-source">${article.source}</span>
                <span class="article-time">${timeAgo(article.timestamp)}</span>
            </div>
        </div>
    `

    list.prepend(card)

    const cards = list.querySelectorAll('.article-card')
    if(cards.length > 50) cards[cards.length - 1].remove()
}

export { state, onArticle, startFeed, renderCard, getPriorityClass, timeAgo }

state.emitter.on(EVENTS.ARTICLE, renderCard)
startFeed()

function updateStats() {
    const total = document.getElementById('s-total')
    const shown = document.getElementById('s-shown')
    const high  = document.getElementById('s-high')
    const queue = document.getElementById('s-queue')

    if(total) total.textContent = state.stats.total
    if(shown) shown.textContent = state.stats.shown
    if(high)  high.textContent  = state.stats.high
    if(queue) queue.textContent = state.queue.size()
}
