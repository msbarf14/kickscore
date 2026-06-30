import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export function getDb() {
  if (!db) {
    const dbPath = process.env.DB_PATH || join(__dirname, 'pildun2026.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

export function upsertMatch(matchData) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO matches (
      fixture_id, league_id, season, stage, round,
      match_date, match_time, match_utc, timezone,
      home_team_id, home_team_name, home_team_code, home_team_logo,
      home_score, home_pen,
      away_team_id, away_team_name, away_team_code, away_team_logo,
      away_score, away_pen,
      status_short, status_long, elapsed,
      venue_name, raw_json, source, last_synced
    ) VALUES (
      @fixture_id, @league_id, @season, @stage, @round,
      @match_date, @match_time, @match_utc, @timezone,
      @home_team_id, @home_team_name, @home_team_code, @home_team_logo,
      @home_score, @home_pen,
      @away_team_id, @away_team_name, @away_team_code, @away_team_logo,
      @away_score, @away_pen,
      @status_short, @status_long, @elapsed,
      @venue_name, @raw_json, @source, CURRENT_TIMESTAMP
    )
    ON CONFLICT(fixture_id) DO UPDATE SET
      stage = @stage,
      round = @round,
      home_score = @home_score,
      home_pen = @home_pen,
      away_score = @away_score,
      away_pen = @away_pen,
      status_short = @status_short,
      status_long = @status_long,
      elapsed = @elapsed,
      match_utc = @match_utc,
      raw_json = @raw_json,
      source = @source,
      last_synced = CURRENT_TIMESTAMP
  `);

  return stmt.run(matchData);
}

export function upsertLineup(lineupData) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO lineups (
      fixture_id, team_id, team_name, formation,
      coach_name, coach_photo, players_json, last_synced
    ) VALUES (
      @fixture_id, @team_id, @team_name, @formation,
      @coach_name, @coach_photo, @players_json, CURRENT_TIMESTAMP
    )
    ON CONFLICT(fixture_id, team_id) DO UPDATE SET
      formation = @formation,
      coach_name = @coach_name,
      coach_photo = @coach_photo,
      players_json = @players_json,
      last_synced = CURRENT_TIMESTAMP
  `);

  return stmt.run(lineupData);
}

export function getMatches(status = null) {
  const database = getDb();
  let query = 'SELECT * FROM matches';
  const params = {};

  if (status) {
    query += ' WHERE LOWER(status_short) = LOWER(@status)';
    params.status = status;
  }

  query += ' ORDER BY match_date DESC, match_time DESC';

  return database.prepare(query).all(params);
}

export function getMatchByFixtureId(fixtureId) {
  const database = getDb();
  return database.prepare('SELECT * FROM matches WHERE fixture_id = ?').get(fixtureId);
}

export function getLineupsByFixtureId(fixtureId) {
  const database = getDb();
  return database.prepare('SELECT * FROM lineups WHERE fixture_id = ?').all(fixtureId);
}

export function getLastSync(syncType = 'matches') {
  const database = getDb();
  return database.prepare(
    'SELECT synced_at FROM sync_log WHERE sync_type = ? ORDER BY synced_at DESC LIMIT 1'
  ).get(syncType);
}

export function logSync(syncType, status, recordsCount = 0, errorMessage = null) {
  const database = getDb();
  database.prepare(
    'INSERT INTO sync_log (sync_type, status, records_count, error_message) VALUES (?, ?, ?, ?)'
  ).run(syncType, status, recordsCount, errorMessage);
}

export function isDataFresh(syncType = 'matches', maxAgeMinutes = 30) {
  const lastSync = getLastSync(syncType);
  if (!lastSync) return false;

  const syncTime = new Date(lastSync.synced_at).getTime();
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000;

  return (now - syncTime) < maxAge;
}

export function getMatchDetail(fixtureId) {
  const database = getDb();
  return database.prepare('SELECT * FROM match_details WHERE fixture_id = ?').get(fixtureId);
}

export function upsertMatchDetail(fixtureId, detailData) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO match_details (
      fixture_id, detail_json, has_goals, has_bookings, has_subs,
      has_stats, has_lineups, has_referees, last_synced
    ) VALUES (
      @fixture_id, @detail_json, @has_goals, @has_bookings, @has_subs,
      @has_stats, @has_lineups, @has_referees, CURRENT_TIMESTAMP
    )
    ON CONFLICT(fixture_id) DO UPDATE SET
      detail_json = @detail_json,
      has_goals = @has_goals,
      has_bookings = @has_bookings,
      has_subs = @has_subs,
      has_stats = @has_stats,
      has_lineups = @has_lineups,
      has_referees = @has_referees,
      last_synced = CURRENT_TIMESTAMP
  `);

  return stmt.run(detailData);
}

export function isDetailFresh(fixtureId, maxAgeHours = 24) {
  const database = getDb();
  const detail = database.prepare(
    'SELECT last_synced FROM match_details WHERE fixture_id = ?'
  ).get(fixtureId);

  if (!detail) return false;

  const syncTime = new Date(detail.last_synced).getTime();
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  return (now - syncTime) < maxAge;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
