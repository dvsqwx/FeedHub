interface Headers {
    [key: string]: string
}

interface Strategy {
    authenticate(headers: Headers): Headers | Promise<Headers>
}

export class ApiKeyStrategy implements Strategy {
    private apiKey: string
    private headerName: string

    constructor(apiKey: string, headerName?: string) {
        this.apiKey = apiKey
        this.headerName = headerName || 'X-API-Key'
    }

    authenticate(headers: Headers): Headers {
        headers[this.headerName] = this.apiKey
        return headers
    }
}

export class BearerTokenStrategy implements Strategy {
    private token: string

    constructor(token: string) {
        this.token = token
    }

    authenticate(headers: Headers): Headers {
        headers['Authorization'] = `Bearer ${this.token}`
        return headers
    }
}

export class OAuthStrategy implements Strategy {
    private clientId: string
    private clientSecret: string
    private tokenUrl: string
    private token: string | null = null
    private expiresAt: number | null = null

    constructor(clientId: string, clientSecret: string, tokenUrl: string) {
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.tokenUrl = tokenUrl
    }

    async getToken(): Promise<string> {
        if(this.token && this.expiresAt && Date.now() < this.expiresAt) {
            return this.token
        }

        this.token = 'oauth_token_' + Date.now()
        this.expiresAt = Date.now() + 3600 * 1000
        return this.token
    }

    async authenticate(headers: Headers): Promise<Headers> {
        const token = await this.getToken()
        headers['Authorization'] = `Bearer ${token}`
        return headers
    }
}

export class RateLimiter {
    private maxPerSecond: number
    private requests: number[] = []

    constructor(maxPerSecond: number) {
        this.maxPerSecond = maxPerSecond
    }

    isAllowed(): boolean {
        const now = Date.now()
        const oneSecondAgo = now - 1000

        this.requests = this.requests.filter(t => t > oneSecondAgo)

        if(this.requests.length >= this.maxPerSecond) {
            return false
        }

        this.requests.push(now)
        return true
    }

    remaining(): number {
        const now = Date.now()
        const oneSecondAgo = now - 1000
        this.requests = this.requests.filter(t => t > oneSecondAgo)
        return this.maxPerSecond - this.requests.length
    }
}

export class AuthProxy {
    private strategy: Strategy
    private rateLimiter: RateLimiter | null

    constructor(strategy: Strategy, rateLimiter?: RateLimiter) {
        this.strategy = strategy
        this.rateLimiter = rateLimiter || null
    }

    private async _request(method: string, url: string, body?: unknown): Promise<Response> {
        if(this.rateLimiter && !this.rateLimiter.isAllowed()) {
            throw new Error('rate limit exceeded')
        }

        let headers: Headers = {}
        headers = await this.strategy.authenticate(headers)

        const options: RequestInit = {
            method,
            headers,
        }

        if(body) {
            options.body = JSON.stringify(body)
            headers['Content-Type'] = 'application/json'
        }

        return fetch(url, options)
    }

    get(url: string): Promise<Response> {
        return this._request('GET', url)
    }

    post(url: string, body: unknown): Promise<Response> {
        return this._request('POST', url, body)
    }
}
