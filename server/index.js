import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import matchesRouter from './routes/matches.js';
import lineupsRouter from './routes/lineups.js';
import syncRouter from './routes/sync.js';
import { startSyncScheduler } from './jobs/syncScheduler.js';
import { getDb, closeDb } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

dotenv.config({ path: join(ROOT, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/matches', matchesRouter);
app.use('/api/lineups', lineupsRouter);
app.use('/api/sync', syncRouter);

app.get('/api/status', (req, res) => {
  try {
    const db = getDb();
    const matchCount = db.prepare('SELECT COUNT(*) as count FROM matches').get();
    const lineupCount = db.prepare('SELECT COUNT(*) as count FROM lineups').get();
    const lastSync = db.prepare(
      'SELECT sync_type, status, records_count, synced_at FROM sync_log ORDER BY synced_at DESC LIMIT 5'
    ).all();

    res.json({
      server: 'running',
      database: 'connected',
      matches: matchCount.count,
      lineups: lineupCount.count,
      recentSyncs: lastSync,
      apiHost: process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
      hasApiKey: !!process.env.API_FOOTBALL_KEY
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, _next) => {
  console.error('[Server] Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const distPath = join(ROOT, 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] API status: http://localhost:${PORT}/api/status`);
  startSyncScheduler();
});

process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  closeDb();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  closeDb();
  server.close(() => process.exit(0));
});
