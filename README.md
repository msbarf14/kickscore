# PILDUN 2026

Dashboard FIFA World Cup 2026 — live scores, jadwal pertandingan, dan lineup.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Express 5, Node.js 20 |
| Database | SQLite (better-sqlite3) |
| API | football-data.org (primary), api-football.com (fallback) |

## Fitur

- Live match indicator dengan real-time polling
- Jadwal pertandingan dan hasil lengkap
- Detail pertandingan (goals, kartu, substitusi, statistik)
- Lineup pemain
- Auto-sync dari external API setiap 30 menit
- Fallback ke static data jika API tidak tersedia

## Project Structure

```
pildun2026/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # UI components
│   ├── hooks/              # React hooks (useMatches, useSync, useStatus)
│   ├── data/               # Static fallback data
│   └── App.jsx             # Main app
├── server/                 # Backend (Express)
│   ├── db/                 # SQLite database & schema
│   ├── routes/             # API routes
│   ├── services/           # External API clients
│   ├── jobs/               # Cron scheduler
│   └── index.js            # Server entry
├── Dockerfile              # Docker build config
└── .env.example            # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

Edit `.env` dan isi API key:

| Variable | Required | Description |
|----------|----------|-------------|
| `FOOTBALL_DATA_TOKEN` | Ya | Token dari [football-data.org](https://www.football-data.org/client/register) |
| `API_FOOTBALL_KEY` | Opsional | Fallback key dari api-football.com |
| `PORT` | Opsional | Server port (default: 3001) |
| `DB_PATH` | Opsional | Path ke SQLite file (default: `./server/db/pildun2026.db`) |
| `SYNC_INTERVAL_MINUTES` | Opsional | Interval auto-sync (default: 30) |

### Development

Jalankan frontend dan backend secara terpisah:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

Atau jalankan keduanya bersamaan:

```bash
npm run dev:all
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:3001/api`

### Sync Data

```bash
# Manual sync
npm run sync

# Cek status
npm run status
```

## Deployment (Docker / Coolify)

### Build Docker Image

```bash
docker build -t pildun2026 .
docker run -p 3001:3001 \
  -v ./data:/app/server/db \
  -e FOOTBALL_DATA_TOKEN=xxx \
  -e API_FOOTBALL_KEY=xxx \
  pildun2026
```

### Deploy ke Coolify

1. Push code ke Git repository
2. Buat new Resource di Coolify → Dockerfile
3. Set **Persistent Storage** mount: `/app/server/db`
4. Set environment variables di Coolify dashboard:
   ```
   FOOTBALL_DATA_TOKEN=xxx
   API_FOOTBALL_KEY=xxx
   PORT=3001
   DB_PATH=/app/server/db/pildun2026.db
   ```
5. Deploy

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
