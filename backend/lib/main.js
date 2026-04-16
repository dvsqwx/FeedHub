'use strict'

const titles = [
    'Bitcoin fell below 70k',
    'Ethereum upgrade goes live',
    'Man spends life savings on Dogecoin',
    'Crypto market crashes overnight',
    'Bitcoin hits new all time high',
    'Ethereum just flipped Bitcoin in volume',
    'New memecoin up 10000% in 24 hours',
    'Binance under investigation again',
    'El Salvador doubles down on Bitcoin',
    'Fed rate decision tanks crypto market',
    'BlackRock files for Ethereum ETF',
    'Tether prints 1 billion USDT overnight',
    'Solana network goes down again',
    'Dogecoin surges after Elon tweet',
    'Crypto whale moves 50k Bitcoin',
    'New iPhone 17e announced',
    'New MacBook neo announced',
    'AI beats humans at chess again',
    'Tesla releases new car',
    'New JavaScript framework dropped',
    'OpenAI releases new model',
    'Google fires 200 engineers replaced by AI',
    'Apple Vision Pro 2 leaked specs',
    'Microsoft adds AI to everything',
    'Meta releases open source AI model',
    'Linux kernel hits 40 million lines of code',
    'Stack Overflow traffic down 40 percent',
    'New MacBook gets 30 hour battery life',
    'GitHub Copilot can now write entire apps',
    'React 20 released with breaking changes',
    'Nvidia GPU shortage hits developers again',
    'Apple sued over App Store monopoly again',
    'SpaceX Starship reaches orbit finally',
    'This meme broke the internet today',
    'This cat video has 50 million views',
    'Man goes viral for eating 100 nuggets',
    'Twitter renamed to X again reportedly',
    'Reddit down for 6 hours nobody noticed',
    'Guy codes entire app using only memes',
    'ChatGPT asked to write a poem about itself',
    'Speedrunner beats game in negative time',
    'Man buys island with NFT profits in 2021',
    'This dog video has more views than the Super Bowl',
    'Woman live streams herself deleting System32',
    'Twitch streamer accidentally codes something useful',
    'Gen Z explains "brain rot" to confused millennials',
    'This "delulu" tweet about coffee has 800k likes',
    'NPC livestreamer earns $40k in one stream',
    'Man quits job via TikTok, video hits 5M views',
    'Duolingo owl meme account reaches 1M followers',
    '"Just girly things" format makes unexpected comeback',
    'Looksmaxxing community hits 500k members on Reddit',
    'Wojak variant goes viral after Fed rate decision',
    'Nobody knows who started this trend',
    'Comment section more entertaining than the video',
    'Guy proposes to girlfriend using GitHub pull request',
]

const categories = ['tech', 'crypto', 'memes']

function getSource(category) {
    const map = {
        crypto: ['CoinDesk', 'X'],
        tech:   ['TechCrunch', 'Wired'],
        memes:  ['Reddit', '9GAG'],
    }
    const list = map[category]
    return list[Math.floor(Math.random() * list.length)]
}

function getRandomPriority(category) {
    if(category === 'crypto') return Math.floor(Math.random() * 4) + 7
    if(category === 'tech')   return Math.floor(Math.random() * 4) + 4
    return Math.floor(Math.random() * 3) + 1
}

async function* newsFeedGenerator(delayMs = 2000) {
    let id = 1
    while(true) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const article = {
            id,
            title:     titles[Math.floor(Math.random() * titles.length)],
            category,
            source:    getSource(category),
            priority:  getRandomPriority(category),
            timestamp: new Date().toISOString(),
            summary:   `This is a summary about ${category} news`,
        }
        yield article
        id++
        await new Promise(resolve => setTimeout(resolve, delayMs))
    }
}

function memoize(fn, options = {}) {
    const maxSize = options.maxSize || 128
    const policy  = options.policy  || 'lru'
    const ttl     = options.ttl     || null

    let cache     = {}
    let lastUsed  = {}
    let useCount  = {}
    let createdAt = {}

    function isExpired(key) {
        if(!ttl) return false
        return Date.now() - createdAt[key] > ttl
    }

    function deleteKey(key) {
        delete cache[key]
        delete lastUsed[key]
        delete useCount[key]
        delete createdAt[key]
    }

    function evict() {
        const keys = Object.keys(cache)
        if(keys.length === 0) return
        let removeKey = keys[0]
        if(policy === 'lru') {
            for(let i = 1; i < keys.length; i++) {
                if(lastUsed[keys[i]] < lastUsed[removeKey]) removeKey = keys[i]
            }
        } else if(policy === 'lfu') {
            for(let i = 1; i < keys.length; i++) {
                if(useCount[keys[i]] < useCount[removeKey]) removeKey = keys[i]
            }
        }
        deleteKey(removeKey)
    }

    function memoized(...args) {
        const key = JSON.stringify(args)
        if(cache[key] !== undefined && isExpired(key)) deleteKey(key)
        if(cache[key] !== undefined) {
            lastUsed[key] = Date.now()
            useCount[key]++
            return cache[key]
        }
        if(Object.keys(cache).length >= maxSize) evict()
        const result = fn(...args)
        cache[key]     = result
        useCount[key]  = 1
        lastUsed[key]  = Date.now()
        createdAt[key] = Date.now()
        return result
    }

    memoized.cacheSize  = () => Object.keys(cache).length
    memoized.clearCache = () => { cache = {}; lastUsed = {}; useCount = {}; createdAt = {} }
    return memoized
}

class BiDirectionalPriorityQueue {
    constructor() {
        this.items = []
        this.count = 0
    }

    enqueue(item, priority = 0) {
        this.items.push({ item, priority, count: this.count })
        this.count++
    }

    _findIndex(mode) {
        let best = 0
        this.items.forEach((entry, i) => {
            if(mode == 'highest' && entry.priority > this.items[best].priority) best = i
            if(mode == 'lowest'  && entry.priority < this.items[best].priority) best = i
            if(mode == 'oldest'  && entry.count    < this.items[best].count)    best = i
            if(mode == 'newest'  && entry.count    > this.items[best].count)    best = i
        })
        return best
    }

    dequeue(mode = 'highest') {
        if(this.items.length == 0) return null
        const i = this._findIndex(mode)
        const found = this.items[i]
        this.items.splice(i, 1)
        return found.item
    }

    peek(mode = 'highest') {
        if(this.items.length == 0) return null
        return this.items[this._findIndex(mode)].item
    }

    size()    { return this.items.length }
    isEmpty() { return this.items.length === 0 }

    toArray(mode = 'highest') {
        const tmp = new BiDirectionalPriorityQueue()
        this.items.forEach(e => tmp.enqueue(e.item, e.priority))
        const res = []
        while(!tmp.isEmpty()) res.push(tmp.dequeue(mode))
        return res
    }
}

const EVENTS = { ARTICLE: 'article', ERROR: 'error', PAUSE: 'pause', RESUME: 'resume', CLEAR: 'clear' }

class EventEmitter {
    constructor() { this.listeners = {} }

    on(event, fn) {
        if(!this.listeners[event]) this.listeners[event] = []
        this.listeners[event].push(fn)
        return this
    }

    off(event, fn) {
        if(!this.listeners[event]) return this
        this.listeners[event] = this.listeners[event].filter(l => l !== fn)
        if(this.listeners[event].length == 0) delete this.listeners[event]
        return this
    }

    emit(event, data) {
        if(!this.listeners[event]) return this
        this.listeners[event].forEach(fn => fn(data))
        return this
    }

    once(event, fn) {
        const wrapper = (data) => { fn(data); this.off(event, wrapper) }
        return this.on(event, wrapper)
    }
}

let _emitterInstance = null
function getEmitter() {
    if(!_emitterInstance) _emitterInstance = new EventEmitter()
    return _emitterInstance
}

const state = {
    articles: [],
    paused:   false,
    queue:    new BiDirectionalPriorityQueue(),
    emitter:  getEmitter(),
    stats:    { total: 0, shown: 0, high: 0 },
    cats:     { tech: 0, crypto: 0, memes: 0 },
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
    getCatCount.clearCache()
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
    return `${Math.floor(mins / 60)}h ago`
}

function renderCard(article) {
    const list = document.getElementById('articles-list')
    if(!list) return
    const empty = list.querySelector('.empty-state')
    if(empty) empty.remove()

    const cls  = getPriorityClass(article.priority)
    const card = document.createElement('div')
    card.className = `article-card ${cls}`
    card.dataset.id       = article.id
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
    const el = (id) => document.getElementById(id)
    if(el('s-total')) el('s-total').textContent = state.stats.total
    if(el('s-shown')) el('s-shown').textContent = state.stats.shown
    if(el('s-high'))  el('s-high').textContent  = state.stats.high
    if(el('s-queue')) el('s-queue').textContent = state.queue.size()
}

function updateCategories() {
    const list = document.getElementById('cat-list')
    if(!list) return
    const total = state.stats.total || 1
    list.innerHTML = ['crypto', 'tech', 'memes'].map(cat => {
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
    list.innerHTML = items.map((article, i) => `
        <div class="queue-row">
            <span class="queue-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="queue-title">${article.title}</span>
        </div>
    `).join('')
}

const logs = []

function addLog(type, message) {
    logs.unshift({ type, message })
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

    document.querySelectorAll('.article-card').forEach(card => {
        const catMatch = !cat || card.dataset.category === cat
        const priMatch = parseInt(card.dataset.priority) >= pri
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
    list.innerHTML = `<div class="empty-state"><div class="spinner"></div><p>waiting for articles...</p></div>`
    state.articles        = []
    state.stats.total     = 0
    state.stats.shown     = 0
    state.stats.high      = 0
    state.cats            = { tech: 0, crypto: 0, memes: 0 }
    while(!state.queue.isEmpty()) state.queue.dequeue()
    getCatCount.clearCache()
    updateStats()
    updateCategories()
    loadQueue()
    updateFeedCount()
    addLog('info', 'feed cleared')
}

const tickerItems = []

function updateTicker(article) {
    tickerItems.push({ cat: article.category, title: article.title })
    if(tickerItems.length > 20) tickerItems.shift()
    const track = document.getElementById('ticker-track')
    if(!track) return
    const half = tickerItems.map(it => `
        <div class="ticker-item">
            <span class="ticker-cat">${it.cat}</span>
            <span class="ticker-sep">/</span>
            ${it.title}
        </div>
    `).join('')
    track.innerHTML = half + half
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
    updateCategories()
    updateStats()
}

document.getElementById('btn-filter').addEventListener('click', applyFilter)
document.getElementById('btn-pause').addEventListener('click', togglePause)
document.getElementById('btn-clear').addEventListener('click', clearFeed)
document.getElementById('btn-stats').addEventListener('click', () => {
    const panel = document.getElementById('stats-panel')
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
})

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
