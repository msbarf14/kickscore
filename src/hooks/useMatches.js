import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const POLL_INTERVAL = 60000;
const TICK_INTERVAL = 1000;

export function useMatches(status = null) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const pollRef = useRef(null);
  const tickRef = useRef(null);
  const matchesRef = useRef([]);

  const fetchMatches = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);

      const url = status
        ? `${API_BASE}/matches?status=${status}`
        : `${API_BASE}/matches`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      const transformed = (data.data || [])
        .map(transformMatchFromApi)
        .filter(Boolean);
      matchesRef.current = transformed;
      setMatches(transformed);
      setMeta(data.meta);
    } catch (err) {
      console.error('[useMatches] Error:', err.message);
      setError(err.message);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [status]);

  const updateLiveMinutes = useCallback(() => {
    const hasLive = matchesRef.current.some(m => m.status === 'live');
    if (!hasLive) return;

    const now = Date.now();
    const updated = matchesRef.current.map(match => {
      if (match.status !== 'live' || !match._matchUtc) return match;

      const startTime = new Date(match._matchUtc).getTime();
      const diffMs = now - startTime;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffSeconds = Math.floor((diffMs % 60000) / 1000);

      if (diffMinutes >= 0 && diffMinutes <= 120) {
        return { ...match, minute: diffMinutes, second: diffSeconds };
      }
      return match;
    });

    matchesRef.current = updated;
    setMatches([...updated]);
  }, []);

  useEffect(() => {
    fetchMatches(false);
  }, [fetchMatches]);

  useEffect(() => {
    const hasLiveMatches = matches.some(m => m.status === 'live');

    if (hasLiveMatches) {
      console.log('[useMatches] Live detected, starting polling + ticker');
      
      pollRef.current = setInterval(() => {
        fetchMatches(true);
      }, POLL_INTERVAL);

      tickRef.current = setInterval(() => {
        updateLiveMinutes();
      }, TICK_INTERVAL);
    } else {
      if (pollRef.current) {
        console.log('[useMatches] No live, stopping polling');
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [matches, fetchMatches, updateLiveMinutes]);

  return { matches, loading, error, meta, refetch: fetchMatches };
}

export function useMatchDetail(fixtureId) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fixtureId) return;

    async function fetchMatch() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/matches/${fixtureId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setMatch(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [fixtureId]);

  return { match, loading, error };
}

export function useLineups(fixtureId) {
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLineups = useCallback(async () => {
    if (!fixtureId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/lineups/${fixtureId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setLineups(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fixtureId]);

  return { lineups, loading, error, fetchLineups };
}

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const syncMatches = useCallback(async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${API_BASE}/sync/matches`, { method: 'POST' });
      const data = await res.json();
      setLastResult(data);
      return data;
    } catch (err) {
      setLastResult({ error: err.message });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncLineups = useCallback(async (fixtureId) => {
    try {
      setSyncing(true);
      const res = await fetch(`${API_BASE}/sync/lineups/${fixtureId}`, { method: 'POST' });
      const data = await res.json();
      setLastResult(data);
      return data;
    } catch (err) {
      setLastResult({ error: err.message });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncing, lastResult, syncMatches, syncLineups };
}

export function useStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, refetch: fetchStatus };
}

function transformMatchFromApi(apiMatch) {
  if (!apiMatch) return null;

  const statusRaw = (apiMatch.status_short || '').toLowerCase();

  const liveStatuses = ['1h', 'ht', '2h', 'et', 'bt', 'p', 'live', 'in_play', 'paused', 'extra_time', 'penalty_shootout'];
  const finishedStatuses = ['ft', 'aet', 'pen', 'finished', 'suspended', 'awarded'];

  let status = 'scheduled';
  if (liveStatuses.includes(statusRaw)) status = 'live';
  else if (finishedStatuses.includes(statusRaw)) status = 'finished';

  const getFlag = (code) => {
    const flagMap = {
      'ARG': '🇦🇷', 'BRA': '🇧🇷', 'FRA': '🇫🇷', 'GER': '🇩🇪',
      'ESP': '🇪🇸', 'POR': '🇵🇹', 'NED': '🇳🇱', 'BEL': '🇧🇪',
      'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'CRO': '🇭🇷', 'MAR': '🇲🇦', 'JPN': '🇯🇵',
      'KOR': '🇰🇷', 'USA': '🇺🇸', 'MEX': '🇲🇽', 'SEN': '🇸🇳',
      'AUS': '🇦🇺', 'SUI': '🇨🇭', 'POL': '🇵🇱', 'DEN': '🇩🇰',
      'TUN': '🇹🇳', 'KSA': '🇸🇦', 'ECU': '🇪🇨', 'URU': '🇺🇾',
      'CAN': '🇨🇦', 'CMR': '🇨🇲', 'SRB': '🇷🇸', 'CRC': '🇨🇷',
      'GHA': '🇬🇭', 'WAL': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'IRN': '🇮🇷', 'QAT': '🇶🇦',
      'PAR': '🇵🇾', 'SWE': '🇸🇪', 'BIH': '🇧🇦', 'AUT': '🇦🇹',
      'RSA': '🇿🇦', 'NOR': '🇳🇴', 'ITA': '🇮🇹', 'COL': '🇨🇴',
      'CIV': '🇨🇮', 'CPV': '🇨🇻', 'JOR': '🇯🇴', 'IRQ': '🇮🇶',
      'NZL': '🇳🇿', 'EGY': '🇪🇬', 'ALG': '🇩🇿', 'COD': '🇨🇩',
      'UZB': '🇺🇿', 'CUW': '🇨🇼', 'HAI': '🇭🇹', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'CZE': '🇨🇿', 'TUR': '🇹🇷', 'PAN': '🇵🇦',
      'NIR': '🇳🇮', 'ISL': '🇮🇸', 'FIN': '🇫🇮', 'MKD': '🇲🇰',
      'MNE': '🇲🇪', 'ISR': '🇮🇱', 'GRE': '🇬🇷', 'BUL': '🇧🇬'
    };
    return flagMap[code] || '🏳️';
  };

  return {
    id: `M${apiMatch.fixture_id}`,
    fixture_id: apiMatch.fixture_id,
    stage: apiMatch.stage || 'WORLD CUP',
    date: apiMatch.match_date,
    time: apiMatch.match_time,
    _matchUtc: apiMatch.match_utc,
    home: {
      id: apiMatch.home_team_id,
      name: apiMatch.home_team_name,
      code: apiMatch.home_team_code,
      logo: apiMatch.home_team_logo,
      flag: getFlag(apiMatch.home_team_code),
      score: apiMatch.home_score,
      pen: apiMatch.home_pen
    },
    away: {
      id: apiMatch.away_team_id,
      name: apiMatch.away_team_name,
      code: apiMatch.away_team_code,
      logo: apiMatch.away_team_logo,
      flag: getFlag(apiMatch.away_team_code),
      score: apiMatch.away_score,
      pen: apiMatch.away_pen
    },
    status,
    minute: calculateInitialElapsed(apiMatch, status),
    venue: apiMatch.venue_name
  };
}

function calculateInitialElapsed(apiMatch, status) {
  if (status !== 'live') return apiMatch.elapsed || null;

  if (apiMatch.elapsed) return apiMatch.elapsed;

  if (apiMatch.match_utc) {
    const startTime = new Date(apiMatch.match_utc).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - startTime) / 60000);

    if (diffMinutes >= 0 && diffMinutes <= 120) {
      return diffMinutes;
    }
  }

  return null;
}
