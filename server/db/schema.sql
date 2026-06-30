CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id INTEGER UNIQUE NOT NULL,
  league_id INTEGER,
  season INTEGER,
  stage TEXT,
  round TEXT,
  match_date TEXT,
  match_time TEXT,
  match_utc TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  home_team_id INTEGER,
  home_team_name TEXT,
  home_team_code TEXT,
  home_team_logo TEXT,
  home_score INTEGER,
  home_pen INTEGER,
  away_team_id INTEGER,
  away_team_name TEXT,
  away_team_code TEXT,
  away_team_logo TEXT,
  away_score INTEGER,
  away_pen INTEGER,
  status_short TEXT,
  status_long TEXT,
  elapsed INTEGER,
  venue_name TEXT,
  raw_json TEXT,
  source TEXT DEFAULT 'unknown',
  last_synced DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id INTEGER UNIQUE NOT NULL,
  detail_json TEXT,
  has_goals INTEGER DEFAULT 0,
  has_bookings INTEGER DEFAULT 0,
  has_subs INTEGER DEFAULT 0,
  has_stats INTEGER DEFAULT 0,
  has_lineups INTEGER DEFAULT 0,
  has_referees INTEGER DEFAULT 0,
  last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fixture_id) REFERENCES matches(fixture_id)
);

CREATE TABLE IF NOT EXISTS lineups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id INTEGER NOT NULL,
  team_id INTEGER,
  team_name TEXT,
  formation TEXT,
  coach_name TEXT,
  coach_photo TEXT,
  players_json TEXT,
  last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fixture_id, team_id)
);

CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_count INTEGER DEFAULT 0,
  error_message TEXT,
  synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_fixture_id ON matches(fixture_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status_short);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_match_details_fixture_id ON match_details(fixture_id);
CREATE INDEX IF NOT EXISTS idx_lineups_fixture_id ON lineups(fixture_id);
