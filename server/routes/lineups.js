import express from 'express';
import { getLineupsByFixtureId, isDataFresh, getLastSync } from '../db/database.js';
import { getLineups, transformLineup } from '../services/apiFootball.js';
import { upsertLineup } from '../db/database.js';

const router = express.Router();

router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const fid = parseInt(fixtureId);

    let lineups = getLineupsByFixtureId(fid);

    if (lineups.length === 0 || !isDataFresh('lineups', 60)) {
      try {
        const apiLineups = await getLineups(fid);

        for (const lineup of apiLineups) {
          const transformed = transformLineup(lineup);
          upsertLineup(transformed);
        }

        lineups = getLineupsByFixtureId(fid);
      } catch (apiError) {
        console.warn('[Lineups] API fetch failed, using cached data:', apiError.message);
      }
    }

    const lastSync = getLastSync('lineups');

    res.json({
      data: lineups.map(l => ({
        ...l,
        players: JSON.parse(l.players_json || '[]'),
        players_json: undefined
      })),
      meta: {
        fixtureId: fid,
        total: lineups.length,
        cached: true,
        lastSync: lastSync?.synced_at || null
      }
    });
  } catch (error) {
    console.error('[Lineups] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
