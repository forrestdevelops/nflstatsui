# NFL Stats UI

A React frontend for the NFL Stats API, displaying team rosters, player profiles, and game-by-game statistics powered by ESPN data.

## Prerequisites

- Node.js 18+
- NFL Stats API running at `http://localhost:8080`

## Getting Started

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). API requests are proxied to `localhost:8080`.

## Pages

- **/** — All 32 NFL teams with search
- **/teams/:teamId** — Team details, record, and full roster with position filters
- **/players/:playerId** — Player bio, career/season stats, and game log