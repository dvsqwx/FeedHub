# Noxr

Noxr is a real-time news aggregator dashboard that streams live articles across crypto, tech, and memes categories. 

## What it does

- Streams live articles using an infinite async generator
- Displays articles in a live feed with priority-based styling
- Maintains a bi-directional priority queue of incoming articles
- Filters articles by category and minimum priority
- Shows category distribution with animated progress bars
- Logs all events in a real-time log panel
- Runs entirely in the browser — no server required

## Tech stack

- **Frontend** — vanilla JavaScript, HTML, CSS
- **Library** — TypeScript and JavaScript ES modules
- **Font** — IBM Plex Mono (Google Fonts)

## Project structure

noxr/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── backend/
│   ├── config.ts
│   └── lib/
│       ├── index.ts
│       ├── generator.ts
│       ├── memoize.ts
│       ├── priorityQueue.ts
│       ├── asyncFilter.ts
│       ├── streams.ts
│       ├── eventEmitter.ts
│       ├── authProxy.ts
│       └── logger.ts
└── package.json

## Running the project

Open `frontend/index.html` directly in a browser or use VS Code Live Server.
@dvsxqw
