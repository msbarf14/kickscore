# PILDUN 2026 — Product Requirements Document

## Overview

Dashboard web untuk FIFA World Cup 2026 yang menampilkan live scores, jadwal pertandingan, statistik, dan lineup pemain. Target pengguna: fans sepakbola Indonesia yang ingin memantau Piala Dunia 2026.

## Target User

- Fans sepakbola Indonesia
- Pengguna mobile dan desktop
- Butuh info real-time selama pertandingan berlangsung

## Core Features

### 1. Live Match Dashboard
- Menampilkan pertandingan yang sedang berlangsung secara real-time
- Indicator live dengan pulsing dot dan elapsed time (menit:detik)
- Auto-refresh setiap 60 detik untuk data terbaru
- Ticker 1 detik untuk update menit live

### 2. Match Schedule & Results
- Tabel jadwal pertandingan dengan filter berdasarkan stage (Grup, 32 Besar, 16 Besar, dll)
- Status pertandingan: Live (merah), Scheduled (kuning), Finished (hijau)
- Score dan informasi venue

### 3. Match Detail
- Detail pertandingan: goals, kartu kuning/merah, substitusi, statistik
- Tab navigation untuk kategori detail
- Data di-cache 24 jam di server

### 4. Team Lineup
- Formasi dan susunan pemain starting XI dan cadangan
- Info pelatih
- Data di-cache 60 menit di server

### 5. API Integration
- **Primary:** football-data.org (gratis untuk World Cup)
- **Fallback:** api-football.com (berbayar)
- Auto-sync setiap 30 menit via cron scheduler
- Manual sync via tombol atau API endpoint

### 6. Responsive Design
- Mobile: 2 kolom grid untuk stats cards
- Desktop: 4 kolom grid
- Dark theme dengan aksen warna (merah=live, kuning=scheduled, hijau=finished)

## Technical Requirements

### Frontend
- React 19 dengan Vite 8
- Tailwind CSS 4 untuk styling
- API base URL configurable via `VITE_API_BASE` env var
- Fallback ke static data jika backend tidak tersedia

### Backend
- Express 5 dengan Node.js 22
- SQLite database dengan better-sqlite3
- Serving frontend static files dari `dist/`
- CORS enabled

### Database Schema
- `matches` — data pertandingan utama
- `match_details` — detail pertandingan (goals, stats, dll)
- `lineups` — susunan pemain
- `sync_log` — log sinkronisasi

### Configuration
- Semua konfigurasi via environment variables
- Timezone configurable (default: Asia/Jakarta)
- Database path configurable

## Deployment

### Platform
- Coolify (self-hosted PaaS)
- Nixpacks build pack
- Persistent storage untuk SQLite database

### Environment Variables (Production)
```
NIXPACKS_NODE_VERSION=22
FOOTBALL_DATA_TOKEN=<token>
API_FOOTBALL_KEY=<key>
PORT=3001
DB_PATH=/app/server/db/pildun2026.db
TIMEZONE=Asia/Singapore
SYNC_INTERVAL_MINUTES=30
```

### Maintenance
- `npm run reset-db` — hapus semua data di database
- `npm run reset` — reset + sync ulang dari API
- `npm run sync` — manual sync tanpa hapus data

## Non-Functional Requirements

- **Performance:** Load time < 3 detik, live ticker responsif
- **Availability:** Auto-sync menjaga data tetap fresh
- **Scalability:** Single server, SQLite sufficient untuk World Cup
- **Security:** API keys di environment variables, tidak di code

## Future Enhancements (Out of Scope)

- Push notification untuk gol
- Multi-bahasa (Inggris/Indonesia)
- Bracket/bracket visualization
- Head-to-head statistics
- Player statistics
