import axios from 'axios';

let client;

function getClient() {
  if (!client) {
    client = axios.create({
      baseURL: 'https://api.football-data.org/v4',
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN
      },
      timeout: 15000
    });

    client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { status, data } = error.response;
          if (status === 429) {
            console.error('[football-data.org] Rate limit exceeded');
          } else if (status === 403) {
            console.error('[football-data.org] Access denied - check API token');
          } else {
            console.error(`[football-data.org] Error ${status}:`, data?.message || error.message);
          }
        } else {
          console.error('[football-data.org] Network error:', error.message);
        }
        throw error;
      }
    );
  }
  return client;
}

export async function getCompetitionMatches(competitionCode = 'WC', params = {}) {
  try {
    const res = await getClient().get(`/competitions/${competitionCode}/matches`, { params });
    return res.data.matches || [];
  } catch (error) {
    console.error('[football-data.org] getCompetitionMatches error:', error.message);
    throw error;
  }
}

export async function getMatch(matchId) {
  try {
    const res = await getClient().get(`/matches/${matchId}`, {
      headers: {
        'X-Unfold-Lineups': 'true',
        'X-Unfold-Goals': 'true',
        'X-Unfold-Bookings': 'true',
        'X-Unfold-Subs': 'true'
      }
    });
    return res.data;
  } catch (error) {
    console.error('[football-data.org] getMatch error:', error.message);
    throw error;
  }
}

export async function getCompetitionTeams(competitionCode = 'WC') {
  try {
    const res = await getClient().get(`/competitions/${competitionCode}/teams`);
    return res.data.teams || [];
  } catch (error) {
    console.error('[football-data.org] getCompetitionTeams error:', error.message);
    throw error;
  }
}

export async function getCompetitionStandings(competitionCode = 'WC') {
  try {
    const res = await getClient().get(`/competitions/${competitionCode}/standings`);
    return res.data.standings || [];
  } catch (error) {
    console.error('[football-data.org] getCompetitionStandings error:', error.message);
    throw error;
  }
}

const TEAM_CODE_MAP = {
  'Argentina': 'ARG', 'Brazil': 'BRA', 'France': 'FRA', 'Germany': 'GER',
  'Spain': 'ESP', 'Portugal': 'POR', 'Netherlands': 'NED', 'Belgium': 'BEL',
  'England': 'ENG', 'Croatia': 'CRO', 'Morocco': 'MAR', 'Japan': 'JPN',
  'South Korea': 'KOR', 'Korea Republic': 'KOR', 'Uruguay': 'URU',
  'Switzerland': 'SUI', 'USA': 'USA', 'Mexico': 'MEX', 'Poland': 'POL',
  'Senegal': 'SEN', 'Australia': 'AUS', 'Denmark': 'DEN', 'Tunisia': 'TUN',
  'Saudi Arabia': 'KSA', 'Ecuador': 'ECU', 'Canada': 'CAN', 'Cameroon': 'CMR',
  'Serbia': 'SRB', 'Costa Rica': 'CRC', 'Ghana': 'GHA', 'Wales': 'WAL',
  'Iran': 'IRN', 'Qatar': 'QAT', 'Nigeria': 'NGA', 'Scotland': 'SCO',
  'Ukraine': 'UKR', 'Czech Republic': 'CZE', 'Austria': 'AUT', 'Hungary': 'HUN',
  'Albania': 'ALB', 'Romania': 'ROU', 'Slovakia': 'SVK', 'Slovenia': 'SVN',
  'Georgia': 'GEO', 'Turkey': 'TUR', 'Italy': 'ITA', 'Norway': 'NOR',
  'Ireland': 'IRL', 'Northern Ireland': 'NIR', 'Iceland': 'ISL', 'Finland': 'FIN',
  'Sweden': 'SWE', 'Bosnia and Herzegovina': 'BIH', 'North Macedonia': 'MKD',
  'Montenegro': 'MNE', 'Israel': 'ISR', 'Greece': 'GRE', 'Bulgaria': 'BUL',
  'Egypt': 'EGY', 'Algeria': 'ALG', 'South Africa': 'RSA',
  'Côte d\'Ivoire': 'CIV', 'Mali': 'MLI', 'Burkina Faso': 'BFA',
  'Paraguay': 'PAR', 'Chile': 'CHI', 'Peru': 'PER', 'Colombia': 'COL',
  'Venezuela': 'VEN', 'Bolivia': 'BOL', 'New Zealand': 'NZL',
  'Jamaica': 'JAM', 'Panama': 'PAN', 'Honduras': 'HON',
  'El Salvador': 'SLV', 'Indonesia': 'IDN', 'Thailand': 'THA',
  'Vietnam': 'VIE', 'Malaysia': 'MAS', 'Philippines': 'PHI',
  'China': 'CHN', 'India': 'IND', 'Iraq': 'IRQ', 'UAE': 'UAE'
};

const FLAG_MAP = {
  'ARG': '🇦🇷', 'BRA': '🇧🇷', 'FRA': '🇫🇷', 'GER': '🇩🇪',
  'ESP': '🇪🇸', 'POR': '🇵🇹', 'NED': '🇳🇱', 'BEL': '🇧🇪',
  'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'CRO': '🇭🇷', 'MAR': '🇲🇦', 'JPN': '🇯🇵',
  'KOR': '🇰🇷', 'USA': '🇺🇸', 'MEX': '🇲🇽', 'SEN': '🇸🇳',
  'AUS': '🇦🇺', 'SUI': '🇨🇭', 'POL': '🇵🇱', 'DEN': '🇩🇰',
  'TUN': '🇹🇳', 'KSA': '🇸🇦', 'ECU': '🇪🇨', 'URU': '🇺🇾',
  'CAN': '🇨🇦', 'CMR': '🇨🇲', 'SRB': '🇷🇸', 'CRC': '🇨🇷',
  'GHA': '🇬🇭', 'WAL': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'IRN': '🇮🇷', 'QAT': '🇶🇦',
  'ITA': '🇮🇹', 'NGA': '🇳🇬', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'UKR': '🇺🇦',
  'CZE': '🇨🇿', 'AUT': '🇦🇹', 'HUN': '🇭🇺', 'ALB': '🇦🇱',
  'ROU': '🇷🇴', 'SVK': '🇸🇰', 'SVN': '🇸🇮', 'GEO': '🇬🇪',
  'TUR': '🇹🇷', 'NOR': '🇳🇴', 'IRL': '🇮🇪', 'NIR': '🇳🇮',
  'ISL': '🇮🇸', 'FIN': '🇫🇮', 'SWE': '🇸🇪', 'BIH': '🇧🇦',
  'MKD': '🇲🇰', 'MNE': '🇲🇪', 'ISR': '🇮🇱', 'GRE': '🇬🇷',
  'PAR': '🇵🇾', 'CHI': '🇨🇱', 'PER': '🇵🇪', 'COL': '🇨🇴',
  'EGY': '🇪🇬', 'ALG': '🇩🇿', 'RSA': '🇿🇦', 'CIV': '🇨🇮',
  'VEN': '🇻🇪', 'NZL': '🇳🇿', 'JAM': '🇯🇲', 'PAN': '🇵🇦',
  'IDN': '🇮🇩'
};

export function getTeamCode(team) {
  if (team.tla) return team.tla;
  return TEAM_CODE_MAP[team.name] || team.shortName?.substring(0, 3).toUpperCase() || '???';
}

export function getFlag(code) {
  return FLAG_MAP[code] || '🏳️';
}

export function transformMatch(match) {
  const home = match.homeTeam || {};
  const away = match.awayTeam || {};
  const score = match.score || {};
  const fullTime = score.fullTime || {};

  const homeCode = getTeamCode(home);
  const awayCode = getTeamCode(away);

  const statusMap = {
    'SCHEDULED': 'scheduled',
    'TIMED': 'scheduled',
    'IN_PLAY': 'live',
    'PAUSED': 'live',
    'EXTRA_TIME': 'live',
    'PENALTY_SHOOTOUT': 'live',
    'FINISHED': 'finished',
    'SUSPENDED': 'finished',
    'POSTPONED': 'scheduled',
    'CANCELLED': 'finished',
    'AWARDED': 'finished'
  };

  const stageMap = {
    'GROUP_STAGE': 'GRUP',
    'LAST_16': '16 BESAR',
    'QUARTER_FINALS': 'PEREMPAT FINAL',
    'SEMI_FINALS': 'SEMIFINAL',
    'THIRD_PLACE': 'TEMPAT KETIGA',
    'FINAL': 'FINAL'
  };

  let stage = stageMap[match.stage] || match.stage || 'WORLD CUP';
  if (match.group) {
    stage = match.group.replace('_', ' ');
  }

  const matchDate = new Date(match.utcDate);
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

  let elapsed = match.minute || null;

  if (!elapsed && match.status === 'IN_PLAY' && match.utcDate) {
    const startTime = new Date(match.utcDate).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - startTime) / 60000);

    if (diffMinutes >= 0 && diffMinutes <= 120) {
      elapsed = diffMinutes;
    }
  }

  return {
    fixture_id: match.id,
    league_id: 2000,
    season: match.season?.startDate ? new Date(match.season.startDate).getFullYear() : 2026,
    stage,
    round: match.stage,
    match_date: dateStr,
    match_time: timeStr,
    match_utc: match.utcDate,
    timezone: 'Asia/Jakarta',
    home_team_id: home.id,
    home_team_name: home.name,
    home_team_code: homeCode,
    home_team_logo: home.crest,
    home_score: fullTime.home,
    home_pen: score.penaltyShoutout?.home || null,
    away_team_id: away.id,
    away_team_name: away.name,
    away_team_code: awayCode,
    away_team_logo: away.crest,
    away_score: fullTime.away,
    away_pen: score.penaltyShoutout?.away || null,
    status_short: statusMap[match.status] || 'scheduled',
    status_long: match.status,
    elapsed,
    venue_name: match.venue || null,
    raw_json: JSON.stringify(match),
    source: 'football-data.org'
  };
}

export function transformEvents(match) {
  const events = [];

  if (match.goals) {
    for (const goal of match.goals) {
      events.push({
        time: goal.minute,
        extra: goal.injuryTime || null,
        team_id: goal.team?.id,
        team_name: goal.team?.name,
        player_name: goal.scorer?.name || 'Unknown',
        assist_name: goal.assist?.name || null,
        type: 'Goal',
        detail: goal.type === 'PENALTY' ? 'Penalty' : goal.type === 'OWN' ? 'Own Goal' : 'Normal Goal',
        comments: null
      });
    }
  }

  if (match.bookings) {
    for (const booking of match.bookings) {
      events.push({
        time: booking.minute,
        extra: null,
        team_id: booking.team?.id,
        team_name: booking.team?.name,
        player_name: booking.player?.name || 'Unknown',
        assist_name: null,
        type: 'Card',
        detail: booking.card === 'YELLOW' ? 'Yellow Card' : booking.card === 'RED' ? 'Red Card' : 'Yellow Red Card',
        comments: null
      });
    }
  }

  if (match.substitutions) {
    for (const sub of match.substitutions) {
      events.push({
        time: sub.minute,
        extra: null,
        team_id: sub.team?.id,
        team_name: sub.team?.name,
        player_name: sub.playerOut?.name || 'Unknown',
        assist_name: sub.playerIn?.name || null,
        type: 'subst',
        detail: 'Substitution',
        comments: null
      });
    }
  }

  events.sort((a, b) => a.time - b.time);
  return events;
}

export function transformLineups(match) {
  const lineups = [];

  for (const side of ['homeTeam', 'awayTeam']) {
    const team = match[side];
    if (!team) continue;

    lineups.push({
      team_id: team.id,
      team_name: team.name,
      team_logo: team.crest,
      formation: team.formation,
      coach_name: team.coach?.name,
      coach_photo: null,
      startXI: (team.lineup || []).map(p => ({
        player: {
          id: p.id,
          name: p.name,
          number: p.shirtNumber,
          pos: p.position?.substring(0, 1) || '?',
          grid: null
        }
      })),
      substitutes: (team.bench || []).map(p => ({
        player: {
          id: p.id,
          name: p.name,
          number: p.shirtNumber,
          pos: p.position?.substring(0, 1) || '?',
          grid: null
        }
      }))
    });
  }

  return lineups;
}

export function transformStatistics(match) {
  const stats = {};

  for (const side of ['homeTeam', 'awayTeam']) {
    const team = match[side];
    if (!team?.statistics) continue;

    const prefix = side === 'homeTeam' ? 'home' : 'away';
    const s = team.statistics;

    stats[prefix] = {
      shots: s.shots || 0,
      shots_on_goal: s.shots_on_goal || 0,
      ball_possession: s.ball_possession || 0,
      corner_kicks: s.corner_kicks || 0,
      fouls: s.fouls || 0,
      yellow_cards: s.yellow_cards || 0,
      red_cards: s.red_cards || 0,
      offsides: s.offsides || 0,
      saves: s.saves || 0
    };
  }

  return stats;
}

export function transformReferees(match) {
  return (match.referees || []).map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    nationality: r.nationality
  }));
}

export function transformGoals(match) {
  return (match.goals || []).map(g => ({
    minute: g.minute,
    injuryTime: g.injuryTime || null,
    type: g.type,
    team_id: g.team?.id,
    team_name: g.team?.name,
    scorer_id: g.scorer?.id,
    scorer_name: g.scorer?.name || 'Unknown',
    assist_id: g.assist?.id,
    assist_name: g.assist?.name || null,
    score_home: g.score?.home,
    score_away: g.score?.away
  }));
}

export function transformBookings(match) {
  return (match.bookings || []).map(b => ({
    minute: b.minute,
    team_id: b.team?.id,
    team_name: b.team?.name,
    player_id: b.player?.id,
    player_name: b.player?.name || 'Unknown',
    card: b.card
  }));
}

export function transformSubstitutions(match) {
  return (match.substitutions || []).map(s => ({
    minute: s.minute,
    team_id: s.team?.id,
    team_name: s.team?.name,
    playerOut_id: s.playerOut?.id,
    playerOut_name: s.playerOut?.name || 'Unknown',
    playerIn_id: s.playerIn?.id,
    playerIn_name: s.playerIn?.name || 'Unknown'
  }));
}

export function transformMatchDetail(match) {
  const home = match.homeTeam || {};
  const away = match.awayTeam || {};
  const score = match.score || {};

  return {
    match: {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      minute: match.minute,
      injuryTime: match.injuryTime,
      attendance: match.attendance,
      venue: match.venue,
      matchday: match.matchday,
      stage: match.stage,
      group: match.group
    },
    home: {
      id: home.id,
      name: home.name,
      shortName: home.shortName,
      tla: home.tla,
      crest: home.crest,
      formation: home.formation,
      coach: home.coach ? {
        id: home.coach.id,
        name: home.coach.name,
        nationality: home.coach.nationality
      } : null
    },
    away: {
      id: away.id,
      name: away.name,
      shortName: away.shortName,
      tla: away.tla,
      crest: away.crest,
      formation: away.formation,
      coach: away.coach ? {
        id: away.coach.id,
        name: away.coach.name,
        nationality: away.coach.nationality
      } : null
    },
    score: {
      winner: score.winner,
      duration: score.duration,
      fullTime: score.fullTime || {},
      halfTime: score.halfTime || {}
    },
    goals: transformGoals(match),
    bookings: transformBookings(match),
    substitutions: transformSubstitutions(match),
    statistics: transformStatistics(match),
    lineups: transformLineups(match),
    referees: transformReferees(match)
  };
}
