import { useState, useEffect } from 'react';

export default function LineupModal({ fixtureId, homeTeam, awayTeam, onClose }) {
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fixtureId) return;

    async function fetchLineups() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/lineups/${fixtureId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setLineups(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLineups();
  }, [fixtureId]);

  const homeLineup = lineups.find(l => l.team_id === homeTeam?.id || l.team_name === homeTeam?.name);
  const awayLineup = lineups.find(l => l.team_id === awayTeam?.id || l.team_name === awayTeam?.name);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-[#222] max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-[#111] border-b border-[#222]">
          <span className="text-[#0f0] text-xs font-bold">LINEUP</span>
          <button onClick={onClose} className="text-[#666] hover:text-[#ccc] transition-colors">
            <span className="text-lg">&times;</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-40px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-4 h-4 border-2 border-[#0f0] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#444] text-sm mt-2">Loading lineup...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-[#f00] text-sm">Error: {error}</p>
              <p className="text-[#444] text-xs mt-1">Lineup mungkin belum tersedia</p>
            </div>
          ) : lineups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#444] text-sm">Lineup belum tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Team */}
              <div className="border border-[#222]">
                <div className="px-3 py-2 bg-[#111] border-b border-[#222]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{homeTeam?.flag}</span>
                    <span className="text-[#ccc] font-bold text-sm">{homeTeam?.name || homeLineup?.team_name}</span>
                  </div>
                  {homeLineup?.formation && (
                    <span className="text-[#444] text-xs">Formation: {homeLineup.formation}</span>
                  )}
                </div>
                <div className="px-3 py-2">
                  {homeLineup?.coach_name && (
                    <div className="mb-3 pb-2 border-b border-[#1a1a1a]">
                      <span className="text-[#444] text-xs">Coach: </span>
                      <span className="text-[#ccc] text-xs">{homeLineup.coach_name}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {(homeLineup?.players || []).map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="text-[#444] w-6 text-right">{player.player?.number || idx + 1}</span>
                        <span className="text-[#ccc]">{player.player?.name || 'Unknown'}</span>
                        <span className="text-[#444] ml-auto">{player.player?.pos || ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div className="border border-[#222]">
                <div className="px-3 py-2 bg-[#111] border-b border-[#222]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{awayTeam?.flag}</span>
                    <span className="text-[#ccc] font-bold text-sm">{awayTeam?.name || awayLineup?.team_name}</span>
                  </div>
                  {awayLineup?.formation && (
                    <span className="text-[#444] text-xs">Formation: {awayLineup.formation}</span>
                  )}
                </div>
                <div className="px-3 py-2">
                  {awayLineup?.coach_name && (
                    <div className="mb-3 pb-2 border-b border-[#1a1a1a]">
                      <span className="text-[#444] text-xs">Coach: </span>
                      <span className="text-[#ccc] text-xs">{awayLineup.coach_name}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {(awayLineup?.players || []).map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="text-[#444] w-6 text-right">{player.player?.number || idx + 1}</span>
                        <span className="text-[#ccc]">{player.player?.name || 'Unknown'}</span>
                        <span className="text-[#444] ml-auto">{player.player?.pos || ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
