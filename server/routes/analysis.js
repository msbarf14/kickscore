import { Router } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

router.get('/standings', (req, res) => {
  try {
    const db = getDb();

    const rows = db.prepare(`
      SELECT
        team_name,
        team_code,
        team_logo,
        SUM(goals_for) AS goals_for,
        SUM(goals_against) AS goals_against,
        SUM(goals_for) - SUM(goals_against) AS goal_diff,
        COUNT(*) AS played,
        SUM(CASE WHEN goals_for > goals_against THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN goals_for = goals_against THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN goals_for < goals_against THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN goals_for > goals_against THEN 3 WHEN goals_for = goals_against THEN 1 ELSE 0 END) AS points
      FROM (
        SELECT
          home_team_name AS team_name,
          home_team_code AS team_code,
          home_team_logo AS team_logo,
          home_score AS goals_for,
          away_score AS goals_against
        FROM matches
        WHERE status_short = 'finished' AND home_score IS NOT NULL

        UNION ALL

        SELECT
          away_team_name AS team_name,
          away_team_code AS team_code,
          away_team_logo AS team_logo,
          away_score AS goals_for,
          home_score AS goals_against
        FROM matches
        WHERE status_short = 'finished' AND away_score IS NOT NULL
      )
      GROUP BY team_name
      ORDER BY points DESC, goal_diff DESC, goals_for DESC, team_name ASC
    `).all();

    const standings = rows.map((row, idx) => ({
      rank: idx + 1,
      team_name: row.team_name,
      team_code: row.team_code,
      team_logo: row.team_logo,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goals_for: row.goals_for,
      goals_against: row.goals_against,
      goal_diff: row.goal_diff,
      points: row.points
    }));

    res.json({ data: standings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
