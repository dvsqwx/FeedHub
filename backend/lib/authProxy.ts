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
