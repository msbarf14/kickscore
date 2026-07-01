import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

dotenv.config({ path: join(ROOT, '..', '.env') });

const DB_PATH = process.env.DB_PATH || join(ROOT, '..', 'server', 'db', 'pildun2026.db');
const PORT = process.env.PORT || 3001;

console.log(`[Reset] Database: ${DB_PATH}`);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const tables = ['lineups', 'match_details', 'sync_log', 'matches'];

for (const table of tables) {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
  db.prepare(`DELETE FROM ${table}`).run();
  console.log(`[Reset] Cleared ${table}: ${count} rows deleted`);
}

db.close();
console.log('[Reset] Database reset complete');
console.log('[Reset] Run "npm run sync" to fetch fresh data');
