"use strict"

// Lab 1 - generator

const titles = [
    'Bitcoin hits new all time high',
    'Ethereum upgrade goes live',
    'New iPhone announced',
    'AI beats humans at chess again',
    'Tesla releases new car',
    'This meme broke the internet today',
    'Man spends life savings on Dogecoin',
    'New JavaScript framework dropped',
    'OpenAI releases new model',
    'This cat video has 50 million views',
]

const categories = ['tech', 'crypto', 'memes']
const sources = ['CoinDesk', 'TechCrunch', 'Reddit', 'X', 'Wired', '9GAG']

function getRandomPriority(category) {
    if (category === 'crypto') return Math.floor(Math.random() * 4) + 7 
    if (category === 'tech') return Math.floor(Math.random() * 4) + 4
    return Math.floor(Math.random() * 3) + 1
}

function getSource(category) {
    const sourcesMap = {
        crypto: ['CoinDesk', 'X'],
        tech: ['TechCrunch', 'Wired'],
        memes: ['Reddit', '9GAG'],
    }
    const list = sourcesMap[category]
    return list[Math.floor(Math.random() * list.length)]
}

export async function* newsFeedGenerator(delayMs = 2000) {
    let id = 1

    while (true) {
        const category = categories[Math.floor(Math.random() * categories.length)]

        const article = {
            id: id,
            title: titles[Math.floor(Math.random() * titles.length)],
            category: category,
            source: getSource(category),
            priority: getRandomPriority(category),
            timestamp: new Date().toISOString(),
            summary: `This is a summary about ${category} news`,
        }

        yield article
        id++

        await new Promise(resolve => setTimeout(resolve, delayMs))
    }
}

export async function timeoutIterator(iterator, timeoutMs, onItem) {
    const results = []
    const startTime = Date.now()

    for await (const item of iterator) {
        if (Date.now() - startTime >= timeoutMs) break

        results.push(item)
        onItem?.(item)
    }

    return results
}
