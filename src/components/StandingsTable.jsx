import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function StandingsTable() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/analysis/standings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStandings(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <span className="text-[#444] text-sm">Loading standings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <span className="text-[#f00] text-sm">Error: {error}</span>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-[#444] text-sm">No finished matches yet</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#222] text-[#666]">
            <th className="text-left py-2 px-2 font-bold">#</th>
            <th className="text-left py-2 px-2 font-bold">Tim</th>
            <th className="text-center py-2 px-1 font-bold">M</th>
            <th className="text-center py-2 px-1 font-bold">Mn</th>
            <th className="text-center py-2 px-1 font-bold">S</th>
            <th className="text-center py-2 px-1 font-bold">K</th>
            <th className="text-center py-2 px-1 font-bold">GM</th>
            <th className="text-center py-2 px-1 font-bold">GK</th>
            <th className="text-center py-2 px-1 font-bold">SG</th>
            <th className="text-center py-2 px-2 font-bold">Poin</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.team_code}
              className="border-b border-[#111] hover:bg-[#0a0a0a] transition-colors"
            >
              <td className="py-2 px-2 text-[#666] font-mono">{team.rank}</td>
              <td className="py-2 px-2">
                <div className="flex items-center gap-2">
                  {team.team_logo && (
                    <img
                      src={team.team_logo}
                      alt={team.team_code}
                      className="w-5 h-5 object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="text-[#ccc] font-bold truncate max-w-[120px] sm:max-w-none">
                    {team.team_name}
                  </span>
                  <span className="text-[#555] hidden sm:inline">({team.team_code})</span>
                </div>
              </td>
              <td className="text-center py-2 px-1 text-[#888]">{team.played}</td>
              <td className="text-center py-2 px-1 text-[#0f0] font-bold">{team.wins}</td>
              <td className="text-center py-2 px-1 text-[#ff0]">{team.draws}</td>
              <td className="text-center py-2 px-1 text-[#f00]">{team.losses}</td>
              <td className="text-center py-2 px-1 text-[#ccc]">{team.goals_for}</td>
              <td className="text-center py-2 px-1 text-[#888]">{team.goals_against}</td>
              <td className={`text-center py-2 px-1 font-bold ${team.goal_diff > 0 ? 'text-[#0f0]' : team.goal_diff < 0 ? 'text-[#f00]' : 'text-[#888]'}`}>
                {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
              </td>
              <td className="text-center py-2 px-2 text-[#ccc] font-bold text-sm">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
