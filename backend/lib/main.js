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

function updateCategories() {
    const list = document.getElementById('cat-list')
    if(!list) return

    const total = state.stats.total || 1
    const cats  = ['crypto', 'tech', 'memes']

    list.innerHTML = cats.map(cat => {
        const count = state.cats[cat] || 0
        const pct   = Math.round((count / total) * 100)

        return `
            <div class="cat-row">
                <div class="cat-header">
                    <span class="cat-name">${cat}</span>
                    <span class="cat-num">${count}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `
    }).join('')
}

function loadQueue() {
    const list = document.getElementById('queue-list')
    if(!list) return

    const items = state.queue.toArray('highest').slice(0, 10)

    if(items.length == 0) {
        list.innerHTML = '<p style="color:#ccc;font-size:10px">empty</p>'
        return
    }

    list.innerHTML = items.map((article, i) => {
        const num = String(i + 1).padStart(2, '0')
        return `
            <div class="queue-row">
                <span class="queue-num">${num}</span>
                <span class="queue-title">${article.title}</span>
            </div>
        `
    }).join('')
}

const logs = []

function addLog(type, message) {
    const time = new Date().toTimeString().slice(0, 8)
    logs.unshift({ type, message, time })
    if(logs.length > 100) logs.pop()
    renderLogs()
}

function renderLogs() {
    const box = document.getElementById('log-output')
    if(!box) return

    box.innerHTML = logs.map(log => `
        <div class="log-${log.type}">[${log.type}] ${log.message}</div>
    `).join('')
}

function applyFilter() {
    const cat = document.getElementById('filter-cat').value
    const pri = parseInt(document.getElementById('filter-pri').value) || 1

    const cards = document.querySelectorAll('.article-card')

    cards.forEach(card => {
        const cardCat = card.dataset.category
        const cardPri = parseInt(card.dataset.priority)

        const catMatch = !cat || cardCat === cat
        const priMatch = cardPri >= pri

        card.style.display = catMatch && priMatch ? '' : 'none'
    })

    const visible = document.querySelectorAll('.article-card:not([style*="none"])').length
    state.stats.shown = visible
    updateStats()

    addLog('call', `filter applied — cat: ${cat || 'all'}, priority: ${pri}+`)
}

function togglePause() {
    state.paused = !state.paused

    const btn = document.getElementById('btn-pause')
    if(btn) btn.textContent = state.paused ? '[ resume ]' : '[ pause ]'

    addLog('info', state.paused ? 'feed paused' : 'feed resumed')
}

function clearFeed() {
    const list = document.getElementById('articles-list')
    if(!list) return

    list.innerHTML = `
        <div class="empty-state">
            <div class="spinner"></div>
            <p>waiting for articles...</p>
        </div>
    `

    state.articles = []
    state.stats.total = 0
    state.stats.shown = 0
    state.stats.high  = 0
    state.cats = { tech: 0, crypto: 0, memes: 0 }

    updateStats()
    updateCategories()
    addLog('info', 'feed cleared')
}

function updateTicker(article) {
    const track = document.getElementById('ticker-track')
    if(!track) return

    const sysItems = track.querySelectorAll('.ticker-item')
    if(sysItems.length <= 4) {
        track.innerHTML = ''
    }

    const item = document.createElement('div')
    item.className = 'ticker-item'
    item.innerHTML = `
        <span class="ticker-cat">${article.category}</span>
        <span class="ticker-sep">/</span>
        ${article.title}
    `

    track.appendChild(item)

    const items = track.querySelectorAll('.ticker-item')
    if(items.length > 40) items[0].remove()
}

function updateFeedCount() {
    const el = document.getElementById('feed-count')
    if(!el) return
    const count = document.querySelectorAll('.article-card').length
    el.textContent = `${count} article${count !== 1 ? 's' : ''}`
}

function init() {
    addLog('info', 'noxr starting...')
    addLog('info', 'generator initialized')
    addLog('call', 'subscribing to article events')
}

document.getElementById('btn-filter').addEventListener('click', applyFilter)
document.getElementById('btn-pause').addEventListener('click', togglePause)
document.getElementById('btn-clear').addEventListener('click', clearFeed)
state.emitter.on(EVENTS.ARTICLE, renderCard)
state.emitter.on(EVENTS.ARTICLE, (article) => {
    updateStats()
    updateCategories()
    loadQueue()
    addLog('info', `article received: ${article.title}`)
})
state.emitter.on(EVENTS.ARTICLE, updateTicker)
state.emitter.on(EVENTS.ARTICLE, updateFeedCount)

init()
startFeed()

export { state, onArticle, startFeed, renderCard, getPriorityClass, timeAgo, updateStats, updateCategories, loadQueue, addLog, applyFilter, togglePause, clearFeed, updateTicker, updateFeedCount }
