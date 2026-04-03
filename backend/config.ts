export enum Category {
    Tech   = 'tech',
    Crypto = 'crypto',
    Memes  = 'memes',
}

export enum Source {
    CoinDesk   = 'CoinDesk',
    X          = 'X',
    TechCrunch = 'TechCrunch',
    Wired      = 'Wired',
    Reddit     = 'Reddit',
    NineGAG    = '9GAG',
}

export const SOURCES: Record<Category, Source[]> = {
    [Category.Crypto]: [Source.CoinDesk, Source.X],
    [Category.Tech]:   [Source.TechCrunch, Source.Wired],
    [Category.Memes]:  [Source.Reddit, Source.NineGAG],
}

export const PRIORITY: Record<Category, { min: number, max: number }> = {
    [Category.Crypto]: { min: 7, max: 10 },
    [Category.Tech]:   { min: 4, max: 7  },
    [Category.Memes]:  { min: 1, max: 3  },
}

export const PRIORITY_LEVELS = {
    high:   7,
    medium: 4,
    low:    1,
} as const

export const APP = {
    name:             'Noxr',
    version:          '1.0.0',
    generatorDelayMs: 2000,
    maxCacheSize:     256,
    cachePolicy:      'lru',
    rateLimitPerSec:  5,
    maxQueueSize:     50,
    logFile:          'logs/app.log',
} as const

export const TITLES: string[] = [
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
