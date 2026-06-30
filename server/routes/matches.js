import express from 'express';
import { 
  getMatches, getMatchByFixtureId, isDataFresh, getLastSync,
  getMatchDetail, upsertMatchDetail, isDetailFresh
} from '../db/database.js';
import { fetchEvents, fetchLineups } from '../services/apiService.js';
import { getMatch, transformMatchDetail } from '../services/footballDataOrg.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const matches = getMatches(status);

    const lastSync = getLastSync('matches');
    const isFresh = isDataFresh('matches', 30);

    res.json({
      data: matches.map(m => ({
        ...m,
        raw_json: undefined
      })),
      meta: {
        total: matches.length,
        cached: true,
        fresh: isFresh,
        lastSync: lastSync?.synced_at || null,
        source: matches[0]?.source || 'unknown'
      }
    });
  } catch (error) {
    console.error('[Matches] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fixtureId', (req, res) => {
  try {
    const { fixtureId } = req.params;
    const match = getMatchByFixtureId(parseInt(fixtureId));

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let rawData = null;
    try {
      rawData = JSON.parse(match.raw_json);
    } catch (e) {
      // ignore
    }

    res.json({
      data: {
        ...match,
        raw_json: undefined,
        details: rawData
      }
    });
  } catch (error) {
    console.error('[Matches] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fixtureId/detail', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const fid = parseInt(fixtureId);

    const cached = getMatchDetail(fid);

    if (cached && isDetailFresh(fid, 24)) {
      console.log(`[Match Detail] Cache hit for fixture ${fid}`);
      return res.json({
        data: JSON.parse(cached.detail_json),
        source: 'cache'
      });
    }

    console.log(`[Match Detail] Cache miss for fixture ${fid}, fetching from API...`);
    const matchData = await getMatch(fid);

    if (!matchData) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const detail = transformMatchDetail(matchData);

    upsertMatchDetail(fid, {
      fixture_id: fid,
      detail_json: JSON.stringify(detail),
      has_goals: detail.goals?.length > 0 ? 1 : 0,
      has_bookings: detail.bookings?.length > 0 ? 1 : 0,
      has_subs: detail.substitutions?.length > 0 ? 1 : 0,
      has_stats: (detail.statistics?.home || detail.statistics?.away) ? 1 : 0,
      has_lineups: detail.lineups?.some(l => l.startXI?.length > 0) ? 1 : 0,
      has_referees: detail.referees?.length > 0 ? 1 : 0
    });

    res.json({ data: detail, source: 'api' });
  } catch (error) {
    console.error('[Match Detail] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fixtureId/events', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const result = await fetchEvents(parseInt(fixtureId));

    res.json({
      data: result.data,
      source: result.source
    });
  } catch (error) {
    console.error('[Events] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fixtureId/lineups', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const result = await fetchLineups(parseInt(fixtureId));

    res.json({
      data: result.data,
      source: result.source
    });
  } catch (error) {
    console.error('[Lineups] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
