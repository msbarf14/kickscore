import express from 'express';
import { fetchMatches, fetchLineups, getCurrentSource } from '../services/apiService.js';
import {
  upsertMatch,
  upsertLineup,
  logSync
} from '../db/database.js';

const router = express.Router();

router.post('/matches', async (req, res) => {
  try {
    console.log('[Sync] Starting matches sync...');

    const competitionCode = process.env.WC_COMPETITION_CODE || 'WC';
    const season = process.env.WC_SEASON || 2026;

    console.log(`[Sync] Fetching matches for competition ${competitionCode}...`);

    const result = await fetchMatches(competitionCode, { season });

    let syncedCount = 0;
    for (const matchData of result.data) {
      try {
        upsertMatch(matchData);
        syncedCount++;
      } catch (err) {
        console.error(`[Sync] Error syncing match ${matchData.fixture_id}:`, err.message);
      }
    }

    logSync('matches', 'success', syncedCount);
    console.log(`[Sync] Matches sync complete: ${syncedCount} records from ${result.source}`);

    res.json({
      success: true,
      message: `Synced ${syncedCount} matches`,
      source: result.source,
      competition: competitionCode,
      season,
      total: result.data.length,
      synced: syncedCount
    });
  } catch (error) {
    console.error('[Sync] Matches sync error:', error.message);
    logSync('matches', 'error', 0, error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/lineups/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const fid = parseInt(fixtureId);

    console.log(`[Sync] Fetching lineups for fixture ${fid}...`);

    const result = await fetchLineups(fid);

    let syncedCount = 0;
    for (const lineup of result.data) {
      try {
        upsertLineup({
          fixture_id: fid,
          team_id: lineup.team_id,
          team_name: lineup.team_name,
          formation: lineup.formation,
          coach_name: lineup.coach_name,
          coach_photo: lineup.coach_photo,
          players_json: JSON.stringify(lineup.startXI || [])
        });
        syncedCount++;
      } catch (err) {
        console.error(`[Sync] Error syncing lineup:`, err.message);
      }
    }

    logSync('lineups', 'success', syncedCount);

    res.json({
      success: true,
      message: `Synced ${syncedCount} lineups`,
      source: result.source,
      fixtureId: fid,
      synced: syncedCount
    });
  } catch (error) {
    console.error('[Sync] Lineups sync error:', error.message);
    logSync('lineups', 'error', 0, error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    res.json({
      source: getCurrentSource(),
      hasFootballDataToken: !!process.env.FOOTBALL_DATA_TOKEN,
      hasApiFootballKey: !!process.env.API_FOOTBALL_KEY
    });
  } catch (error) {
    res.json({
      error: error.message,
      hasFootballDataToken: !!process.env.FOOTBALL_DATA_TOKEN,
      hasApiFootballKey: !!process.env.API_FOOTBALL_KEY
    });
  }
});

export default router;
