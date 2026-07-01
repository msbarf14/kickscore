# PILDUN 2026

Dashboard FIFA World Cup 2026 — live scores, jadwal pertandingan, dan lineup.

**Live:** https://wc2026.angsanaemporium.com

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Express 5, Node.js 22 |
| Database | SQLite (better-sqlite3) |
| API | football-data.org (primary), api-football.com (fallback) |
| Deploy | Nixpacks + Coolify |

## Fitur

- Live match indicator dengan real-time polling (1 detik)
- Jadwal pertandingan dan hasil lengkap
- Detail pertandingan (goals, kartu, substitusi, statistik)
- Lineup pemain
- Auto-sync dari external API setiap 30 menit
- Configurable timezone (default: Asia/Jakarta)
- Fallback ke static data jika API tidak tersedia
- Responsive mobile grid (2 kolom mobile, 4 kolom desktop)

## Project Structure

```
pildun2026/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # UI components
│   │   ├── Icons.jsx           # Icon components (Fire, Sync, dll)
│   │   ├── MatchCard.jsx       # Live match card
│   │   ├── MatchTable.jsx      # Match schedule table
│   │   ├── MatchDetailModal.jsx # Match detail popup
│   │   └── LineupModal.jsx     # Lineup popup
│   ├── hooks/
│   │   └── useMatches.js       # React hooks (useMatches, useSync, useStatus)
│   ├── data/
│   │   └── matches.js          # Static fallback data
│   └── App.jsx                 # Main app
├── server/                     # Backend (Express)
│   ├── db/                     # SQLite database & schema
│   ├── routes/                 # API routes
│   ├── services/               # External API clients
│   ├── jobs/                   # Cron scheduler
│   ├── scripts/
│   │   └── reset-db.js         # Database reset script
│   └── index.js                # Server entry
├── nixpacks.toml               # Nixpacks deploy config
├── .nvmrc                      # Node.js version
└── .env.example                # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
npm install
cp .env.example .env
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FOOTBALL_DATA_TOKEN` | Ya | Token dari [football-data.org](https://www.football-data.org/client/register) |
| `API_FOOTBALL_KEY` | Opsional | Fallback key dari api-football.com |
| `API_FOOTBALL_HOST` | Opsional | API host (default: `v3.football.api-sports.io`) |
| `PORT` | Opsional | Server port (default: `3001`) |
| `DB_PATH` | Opsional | Path ke SQLite file (default: `./server/db/pildun2026.db`) |
| `TIMEZONE` | Opsional | Timezone IANA (default: `Asia/Jakarta`) |
| `SYNC_INTERVAL_MINUTES` | Opsional | Interval auto-sync (default: `30`) |

### Development

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev

# Atau keduanya bersamaan
npm run dev:all
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:3001/api`

### Sync & Reset Data

```bash
# Manual sync
npm run sync

# Reset database (hapus semua data)
npm run reset-db

# Reset + sync ulang
npm run reset

# Cek status
npm run status
```

## Deployment (Coolify + Nixpacks)

### Deploy ke Coolify

1. Push code ke Git repository
2. Buat new Resource di Coolify
3. **Build Pack** → pilih **Nixpacks**
4. Set **Persistent Storage** mount: `/app/server/db`
5. Set environment variables di Coolify dashboard:
   ```
   NIXPACKS_NODE_VERSION=22
   FOOTBALL_DATA_TOKEN=xxx
   API_FOOTBALL_KEY=xxx
   PORT=3001
   DB_PATH=/app/server/db/pildun2026.db
   TIMEZONE=Asia/Singapore
   SYNC_INTERVAL_MINUTES=30
   ```
6. Deploy

### Reset Database di Production

Masuk ke container terminal di Coolify, lalu jalankan:

```bash
node server/scripts/reset-db.js
curl -X POST http://localhost:3001/api/sync/matches
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Semua pertandingan |
| GET | `/api/matches/:id` | Detail pertandingan |
| GET | `/api/matches/:id/detail` | Full detail (goals, stats, lineups) |
| GET | `/api/matches/:id/events` | Match events |
| GET | `/api/lineups/:id` | Team lineups |
| POST | `/api/sync/matches` | Trigger sync matches |
| POST | `/api/sync/lineups/:id` | Trigger sync lineups |
| GET | `/api/sync/status` | Status API source |
| GET | `/api/status` | Server health check |

## License

Private
