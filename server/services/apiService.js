import * as footballData from './footballDataOrg.js';
import * as apiFootball from './apiFootball.js';

const API_SOURCE = {
  FOOTBALL_DATA: 'football-data.org',
  API_FOOTBALL: 'api-football.com'
};

let currentSource = API_SOURCE.FOOTBALL_DATA;

export function getCurrentSource() {
  return currentSource;
}

export async function fetchMatches(competitionCode = 'WC', params = {}) {
  if (process.env.FOOTBALL_DATA_TOKEN) {
    try {
      console.log('[API] Fetching matches from football-data.org...');
      const matches = await footballData.getCompetitionMatches(competitionCode, params);
      currentSource = API_SOURCE.FOOTBALL_DATA;
      console.log(`[API] Got ${matches.length} matches from football-data.org`);
      return {
        source: API_SOURCE.FOOTBALL_DATA,
        data: matches.map(m => footballData.transformMatch(m))
      };
    } catch (error) {
      console.warn('[API] football-data.org failed, trying fallback...', error.message);
    }
  }

  if (process.env.API_FOOTBALL_KEY) {
    try {
      console.log('[API] Fetching matches from api-football.com...');
      const leagueId = competitionCode === 'WC' ? 1 : null;
      const season = params.season || 2022;
      if (!leagueId) throw new Error('Unsupported competition for api-football.com');

      const fixtures = await apiFootball.getFixtures(leagueId, season);
      currentSource = API_SOURCE.API_FOOTBALL;
      console.log(`[API] Got ${fixtures.length} matches from api-football.com`);
      return {
        source: API_SOURCE.API_FOOTBALL,
        data: fixtures.map(f => apiFootball.transformFixtureToMatch(f))
      };
    } catch (error) {
      console.warn('[API] api-football.com also failed:', error.message);
    }
  }

  throw new Error('All API sources failed');
}

export async function fetchMatchDetail(matchId) {
  if (process.env.FOOTBALL_DATA_TOKEN) {
    try {
      console.log(`[API] Fetching match ${matchId} from football-data.org...`);
      const match = await footballData.getMatch(matchId);
      currentSource = API_SOURCE.FOOTBALL_DATA;
      return {
        source: API_SOURCE.FOOTBALL_DATA,
        data: footballData.transformMatch(match),
        events: footballData.transformEvents(match),
        lineups: footballData.transformLineups(match),
        statistics: footballData.transformStatistics(match)
      };
    } catch (error) {
      console.warn('[API] football-data.org failed, trying fallback...', error.message);
    }
  }

  if (process.env.API_FOOTBALL_KEY) {
    try {
      console.log(`[API] Fetching match ${matchId} from api-football.com...`);
      const fixture = await apiFootball.getFixtureById(matchId);
      if (!fixture) throw new Error('Match not found');

      const events = await apiFootball.getFixtureEvents(matchId);
      const lineups = await apiFootball.getLineups(matchId);

      currentSource = API_SOURCE.API_FOOTBALL;
      return {
        source: API_SOURCE.API_FOOTBALL,
        data: apiFootball.transformFixtureToMatch(fixture),
        events: events.map(e => ({
          time: e.time?.elapsed || 0,
          extra: e.time?.extra || null,
          team_id: e.team?.id,
          team_name: e.team?.name,
          player_name: e.player?.name || 'Unknown',
          assist_name: e.assist?.name || null,
          type: e.type,
          detail: e.detail,
          comments: e.comments
        })),
        lineups: lineups.map(l => ({
          team_id: l.team?.id,
          team_name: l.team?.name,
          team_logo: l.team?.logo,
          formation: l.formation,
          coach_name: l.coach?.name,
          coach_photo: l.coach?.photo,
          startXI: l.startXI || [],
          substitutes: l.substitutes || []
        })),
        statistics: null
      };
    } catch (error) {
      console.warn('[API] api-football.com also failed:', error.message);
    }
  }

  throw new Error('All API sources failed');
}

export async function fetchEvents(matchId) {
  if (process.env.FOOTBALL_DATA_TOKEN) {
    try {
      const match = await footballData.getMatch(matchId);
      return {
        source: API_SOURCE.FOOTBALL_DATA,
        data: footballData.transformEvents(match)
      };
    } catch (error) {
      console.warn('[API] football-data.org failed for events:', error.message);
    }
  }

  if (process.env.API_FOOTBALL_KEY) {
    try {
      const events = await apiFootball.getFixtureEvents(matchId);
      return {
        source: API_SOURCE.API_FOOTBALL,
        data: events.map(e => ({
          time: e.time?.elapsed || 0,
          extra: e.time?.extra || null,
          team_id: e.team?.id,
          team_name: e.team?.name,
          player_name: e.player?.name || 'Unknown',
          assist_name: e.assist?.name || null,
          type: e.type,
          detail: e.detail,
          comments: e.comments
        }))
      };
    } catch (error) {
      console.warn('[API] api-football.com failed for events:', error.message);
    }
  }

  throw new Error('All API sources failed for events');
}

export async function fetchLineups(matchId) {
  if (process.env.FOOTBALL_DATA_TOKEN) {
    try {
      const match = await footballData.getMatch(matchId);
      return {
        source: API_SOURCE.FOOTBALL_DATA,
        data: footballData.transformLineups(match)
      };
    } catch (error) {
      console.warn('[API] football-data.org failed for lineups:', error.message);
    }
  }

  if (process.env.API_FOOTBALL_KEY) {
    try {
      const lineups = await apiFootball.getLineups(matchId);
      return {
        source: API_SOURCE.API_FOOTBALL,
        data: lineups.map(l => ({
          team_id: l.team?.id,
          team_name: l.team?.name,
          team_logo: l.team?.logo,
          formation: l.formation,
          coach_name: l.coach?.name,
          coach_photo: l.coach?.photo,
          startXI: l.startXI || [],
          substitutes: l.substitutes || []
        }))
      };
    } catch (error) {
      console.warn('[API] api-football.com failed for lineups:', error.message);
    }
  }

  throw new Error('All API sources failed for lineups');
}
