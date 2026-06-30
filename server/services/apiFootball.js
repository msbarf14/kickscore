import axios from 'axios';

let apiClient;

function getClient() {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: `https://${process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'}`,
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
      },
      timeout: 10000
    });

    apiClient.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { status, data } = error.response;
          if (status === 429) {
            console.error('[API-Football] Rate limit exceeded');
          } else if (status === 401) {
            console.error('[API-Football] Invalid API key');
          } else {
            console.error(`[API-Football] Error ${status}:`, data?.message || error.message);
          }
        } else {
          console.error('[API-Football] Network error:', error.message);
        }
        throw error;
      }
    );
  }
  return apiClient;
}

export async function searchLeague(name = 'World Cup') {
  try {
    const res = await getClient().get('/leagues', {
      params: { search: name }
    });

    if (res.data.results > 0) {
      const worldCup = res.data.response.find(
        l => l.league.name === 'World Cup' && l.league.type === 'Cup'
      );
      return worldCup || res.data.response[0];
    }
    return null;
  } catch (error) {
    console.error('[API-Football] searchLeague error:', error.message);
    throw error;
  }
}

export async function getFixtures(leagueId, season) {
  try {
    const res = await getClient().get('/fixtures', {
      params: { league: leagueId, season }
    });
    return res.data.response || [];
  } catch (error) {
    console.error('[API-Football] getFixtures error:', error.message);
    throw error;
  }
}

export async function getFixturesByDate(leagueId, date) {
  try {
    const res = await getClient().get('/fixtures', {
      params: { league: leagueId, date }
    });
    return res.data.response || [];
  } catch (error) {
    console.error('[API-Football] getFixturesByDate error:', error.message);
    throw error;
  }
}

export async function getLineups(fixtureId) {
  try {
    const res = await getClient().get('/fixtures/lineups', {
      params: { fixture: fixtureId }
    });
    return res.data.response || [];
  } catch (error) {
    console.error('[API-Football] getLineups error:', error.message);
    throw error;
  }
}

export async function getFixtureEvents(fixtureId) {
  try {
    const res = await getClient().get('/fixtures/events', {
      params: { fixture: fixtureId }
    });
    return res.data.response || [];
  } catch (error) {
    console.error('[API-Football] getFixtureEvents error:', error.message);
    throw error;
  }
}

export async function getFixtureById(fixtureId) {
  try {
    const res = await getClient().get('/fixtures', {
      params: { id: fixtureId }
    });
    return res.data.response?.[0] || null;
  } catch (error) {
    console.error('[API-Football] getFixtureById error:', error.message);
    throw error;
  }
}

export function transformFixtureToMatch(fixture) {
  const f = fixture.fixture || {};
  const league = fixture.league || {};
  const teams = fixture.teams || {};
  const goals = fixture.goals || {};
  const score = fixture.score || {};

  const home = teams.home || {};
  const away = teams.away || {};

  const matchDate = new Date(f.date);
  const dateStr = matchDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  });
  const timeStr = matchDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    hour12: false
  });

  const getTeamCode = (name) => {
    if (!name) return '???';
    const codeMap = {
      'Argentina': 'ARG', 'Brazil': 'BRA', 'France': 'FRA', 'Germany': 'GER',
      'Spain': 'ESP', 'Portugal': 'POR', 'Netherlands': 'NED', 'Belgium': 'BEL',
      'England': 'ENG', 'Croatia': 'CRO', 'Morocco': 'MAR', 'Japan': 'JPN',
      'South Korea': 'KOR', 'USA': 'USA', 'Mexico': 'MEX', 'Senegal': 'SEN',
      'Australia': 'AUS', 'Switzerland': 'SUI', 'Poland': 'POL', 'Denmark': 'DEN',
      'Tunisia': 'TUN', 'Saudi Arabia': 'KSA', 'Ecuador': 'ECU', 'Uruguay': 'URU',
      'Canada': 'CAN', 'Cameroon': 'CMR', 'Serbia': 'SRB', 'Costa Rica': 'CRC',
      'Ghana': 'GHA', 'Wales': 'WAL', 'Iran': 'IRN', 'Qatar': 'QAT',
      'Paraguay': 'PAR', 'Sweden': 'SWE', 'Bosnia and Herzegovina': 'BIH',
      'Austria': 'AUT', 'South Africa': 'RSA'
    };
    return codeMap[name] || name.substring(0, 3).toUpperCase();
  };

  const homeCode = getTeamCode(home.name);
  const awayCode = getTeamCode(away.name);

  let statusShort = f.status?.short || 'NS';
  let statusLong = f.status?.long || 'Not Started';

  let stageText = league.round || league.name || 'World Cup';
  if (stageText.includes('Group')) {
    stageText = stageText.replace('Group', 'GRUP');
  } else if (stageText.includes('Round of')) {
    stageText = '32 BESAR';
  } else if (stageText.includes('Quarter')) {
    stageText = 'PEREMPAT FINAL';
  } else if (stageText.includes('Semi')) {
    stageText = 'SEMIFINAL';
  } else if (stageText.includes('Final')) {
    stageText = 'FINAL';
  }

  return {
    fixture_id: f.id,
    league_id: league.id,
    season: league.season,
    stage: stageText,
    round: league.round,
    match_date: dateStr,
    match_time: timeStr,
    timezone: f.timezone,
    home_team_id: home.id,
    home_team_name: home.name,
    home_team_code: homeCode,
    home_team_logo: home.logo,
    home_score: goals.home,
    home_pen: score.penalty?.home || null,
    away_team_id: away.id,
    away_team_name: away.name,
    away_team_code: awayCode,
    away_team_logo: away.logo,
    away_score: goals.away,
    away_pen: score.penalty?.away || null,
    status_short: statusShort,
    status_long: statusLong,
    elapsed: f.status?.elapsed,
    venue_name: f.venue?.name || null,
    raw_json: JSON.stringify(fixture)
  };
}

export function transformLineup(lineup) {
  return {
    fixture_id: lineup.fixture.id,
    team_id: lineup.team.id,
    team_name: lineup.team.name,
    formation: lineup.formation,
    coach_name: lineup.coach?.name || null,
    coach_photo: lineup.coach?.photo || null,
    players_json: JSON.stringify(lineup.startXI || [])
  };
}

export function getApiUsage() {
  return getClient().get('/status');
}
