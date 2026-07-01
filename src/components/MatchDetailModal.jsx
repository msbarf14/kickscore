import { useState, useEffect } from 'react';
import { CloseIcon, LoadingIcon, PlayIcon, FlagIcon } from './Icons';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function MatchDetailModal({ match, onClose }) {
  const [activeTab, setActiveTab] = useState('goals');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  useEffect(() => {
    if (!match?.fixture_id) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/matches/${match.fixture_id}/detail`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setDetail(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [match?.fixture_id]);

  const hasGoals = detail?.goals?.length > 0;
  const hasBookings = detail?.bookings?.length > 0;
  const hasSubs = detail?.substitutions?.length > 0;
  const hasStats = detail?.statistics?.home || detail?.statistics?.away;
  const hasLineups = detail?.lineups?.some(l => l.startXI?.length > 0);
  const hasReferees = detail?.referees?.length > 0;

  const tabs = [
    { key: 'goals', label: 'Goals', icon: '⚽', available: hasGoals },
    { key: 'cards', label: 'Cards', icon: '🟨', available: hasBookings },
    { key: 'subs', label: 'Subs', icon: '🔄', available: hasSubs },
    { key: 'stats', label: 'Stats', icon: '📊', available: hasStats },
    { key: 'lineup', label: 'Lineup', icon: '👥', available: hasLineups },
    { key: 'referees', label: 'Referees', icon: '👨‍⚖️', available: hasReferees }
  ];

  const availableTabs = tabs.filter(t => t.available);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(t => t.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  const getGoalIcon = (type) => {
    if (type === 'PENALTY') return '⚽🎯';
    if (type === 'OWN_GOAL') return '⚽🔴';
    return '⚽';
  };

  const getCardIcon = (card) => {
    if (card === 'YELLOW') return '🟨';
    if (card === 'RED') return '🟥';
    if (card === 'YELLOW_RED') return '🟨🟥';
    return '•';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#0a0a0a] border border-[#222] max-w-2xl w-full max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-[#111] border-b border-[#222]">
          <div className="flex items-center gap-2">
            {isLive && (
              <>
                <PlayIcon size={12} className="text-[#f00] animate-pulse" />
                <span className="text-[#f00] text-xs font-bold">LIVE</span>
                <span className="text-[#444] text-xs tabular-nums">
                  {match.minute !== null && match.minute !== undefined
                    ? `${match.minute}:${String(match.second || 0).padStart(2, '0')}`
                    : 'In Play'}
                </span>
              </>
            )}
            {isFinished && (
              <div className="flex items-center gap-1.5 text-[#0f0] text-xs font-bold">
                <FlagIcon size={12} />
                <span>FINISHED</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-[#ccc] transition-colors">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Score */}
        <div className="px-6 py-6 bg-[#0a0a0a] border-b border-[#222]">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-4 min-w-[140px] justify-end">
              <span className="text-[#ccc] font-bold text-xl">{match.home?.code}</span>
              <span className="text-3xl">{match.home?.flag}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold text-[#ccc]">{match.home?.score}</span>
                <span className="text-3xl text-[#444]">-</span>
                <span className="text-5xl font-bold text-[#ccc]">{match.away?.score}</span>
              </div>
              {detail?.score?.halfTime?.home !== undefined && (
                <span className="text-[#444] text-sm mt-2">
                  HT: {detail.score.halfTime.home} - {detail.score.halfTime.away}
                </span>
              )}
              {detail?.score?.duration && detail.score.duration !== 'REGULAR' && (
                <span className="text-[#ff0] text-sm mt-1 font-bold">
                  {detail.score.duration === 'PENALTY_SHOOTOUT' ? 'Penalties' : 'Extra Time'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 min-w-[140px]">
              <span className="text-3xl">{match.away?.flag}</span>
              <span className="text-[#ccc] font-bold text-xl">{match.away?.code}</span>
            </div>
          </div>
          {detail?.match?.venue && (
            <div className="text-center mt-3">
              <span className="text-[#444] text-sm">{detail.match.venue}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        {availableTabs.length > 0 && (
          <div className="flex border-b border-[#222] overflow-x-auto">
            {availableTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-[#0f0] border-b-2 border-[#0f0] bg-[#0a0a0a]'
                    : 'text-[#444] hover:text-[#666]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <LoadingIcon size={16} className="text-[#0f0]" />
              <p className="text-[#444] text-sm mt-2">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-[#f00] text-sm">Error: {error}</p>
            </div>
          ) : !detail ? (
            <div className="text-center py-8">
              <p className="text-[#444] text-sm">Data not available</p>
            </div>
          ) : availableTabs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#444] text-sm">Detail data not available for this match</p>
              <p className="text-[#333] text-xs mt-1">Free plan limitation</p>
            </div>
          ) : (
            <>
              {/* Goals Tab */}
              {activeTab === 'goals' && hasGoals && (
                <div className="p-4">
                  <div className="space-y-2">
                    {detail.goals.map((goal, idx) => {
                      const isHome = goal.team_id === detail.home?.id;
                      return (
                        <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-[#0a1a0a] rounded">
                          <span className="text-sm w-6 text-center">{getGoalIcon(goal.type)}</span>
                          <span className="text-[#666] text-xs w-10 text-right">{goal.minute}&apos;</span>
                          <div className="flex-1">
                            <span className="text-[#ccc] text-xs">{goal.scorer_name}</span>
                            {goal.assist_name && (
                              <span className="text-[#444] text-xs"> (assist: {goal.assist_name})</span>
                            )}
                          </div>
                          <span className="text-[#666] text-xs">{goal.score_home}-{goal.score_away}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isHome ? 'bg-[#1a2a1a] text-[#4a4]' : 'bg-[#1a1a2a] text-[#44a]'
                          }`}>
                            {isHome ? detail.home?.tla : detail.away?.tla}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === 'cards' && hasBookings && (
                <div className="p-4">
                  <div className="space-y-2">
                    {detail.bookings.map((booking, idx) => {
                      const isHome = booking.team_id === detail.home?.id;
                      return (
                        <div key={idx} className={`flex items-center gap-3 px-3 py-2 rounded ${
                          booking.card === 'YELLOW' ? 'bg-[#1a1a0a]' : 'bg-[#1a0a0a]'
                        }`}>
                          <span className="text-sm">{getCardIcon(booking.card)}</span>
                          <span className="text-[#666] text-xs w-10 text-right">{booking.minute}&apos;</span>
                          <span className="text-[#ccc] text-xs flex-1">{booking.player_name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isHome ? 'bg-[#1a2a1a] text-[#4a4]' : 'bg-[#1a1a2a] text-[#44a]'
                          }`}>
                            {isHome ? detail.home?.tla : detail.away?.tla}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Substitutions Tab */}
              {activeTab === 'subs' && hasSubs && (
                <div className="p-4">
                  <div className="space-y-2">
                    {detail.substitutions.map((sub, idx) => {
                      const isHome = sub.team_id === detail.home?.id;
                      return (
                        <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-[#0a0a0a] rounded">
                          <span className="text-sm">🔄</span>
                          <span className="text-[#666] text-xs w-10 text-right">{sub.minute}&apos;</span>
                          <div className="flex-1">
                            <span className="text-[#0f0] text-xs">{sub.playerIn_name}</span>
                            <span className="text-[#444] text-xs mx-1">←</span>
                            <span className="text-[#f00] text-xs">{sub.playerOut_name}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isHome ? 'bg-[#1a2a1a] text-[#4a4]' : 'bg-[#1a1a2a] text-[#44a]'
                          }`}>
                            {isHome ? detail.home?.tla : detail.away?.tla}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && hasStats && (
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { key: 'ball_possession', label: 'Possession', unit: '%' },
                      { key: 'shots', label: 'Shots' },
                      { key: 'shots_on_goal', label: 'Shots on Target' },
                      { key: 'corner_kicks', label: 'Corners' },
                      { key: 'fouls', label: 'Fouls' },
                      { key: 'yellow_cards', label: 'Yellow Cards' },
                      { key: 'red_cards', label: 'Red Cards' },
                      { key: 'offsides', label: 'Offsides' },
                      { key: 'saves', label: 'Saves' }
                    ].map(stat => {
                      const homeVal = detail.statistics?.home?.[stat.key] || 0;
                      const awayVal = detail.statistics?.away?.[stat.key] || 0;
                      const total = homeVal + awayVal;
                      const homePct = total > 0 ? (homeVal / total) * 100 : 50;

                      return (
                        <div key={stat.key}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[#ccc] text-xs font-bold">{homeVal}{stat.unit || ''}</span>
                            <span className="text-[#444] text-xs">{stat.label}</span>
                            <span className="text-[#ccc] text-xs font-bold">{awayVal}{stat.unit || ''}</span>
                          </div>
                          <div className="flex h-1.5 bg-[#1a1a1a] rounded overflow-hidden">
                            <div className="bg-[#0f0] transition-all" style={{ width: `${homePct}%` }} />
                            <div className="bg-[#44a] transition-all" style={{ width: `${100 - homePct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lineup Tab */}
              {activeTab === 'lineup' && hasLineups && (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {detail.lineups.map((lineup, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#222]">
                          <span className="text-[#ccc] font-bold text-xs">{lineup.team_name}</span>
                          {lineup.formation && (
                            <span className="text-[#444] text-[10px] ml-auto">{lineup.formation}</span>
                          )}
                        </div>
                        {lineup.coach_name && (
                          <div className="mb-3 text-[10px]">
                            <span className="text-[#444]">Coach: </span>
                            <span className="text-[#666]">{lineup.coach_name}</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {(lineup.startXI || []).map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px]">
                              <span className="text-[#444] w-4 text-right">{p.player?.number}</span>
                              <span className="text-[#ccc]">{p.player?.name}</span>
                              <span className="text-[#333] ml-auto">{p.player?.pos}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referees Tab */}
              {activeTab === 'referees' && hasReferees && (
                <div className="p-4">
                  <div className="space-y-2">
                    {detail.referees.map((ref, idx) => {
                      const typeLabel = {
                        'REFEREE': 'Referee',
                        'ASSISTANT_REFEREE_N1': 'Assistant 1',
                        'ASSISTANT_REFEREE_N2': 'Assistant 2',
                        'FOURTH_OFFICIAL': '4th Official',
                        'VIDEO_ASSISTANT_REFEREE_N1': 'VAR 1',
                        'VIDEO_ASSISTANT_REFEREE_N2': 'VAR 2'
                      }[ref.type] || ref.type;

                      return (
                        <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-[#0a0a0a] rounded">
                          <span className="text-sm">{ref.type.includes('VIDEO') ? '📺' : '👨‍⚖️'}</span>
                          <div className="flex-1">
                            <span className="text-[#ccc] text-xs">{ref.name}</span>
                            {ref.nationality && (
                              <span className="text-[#444] text-xs ml-1">({ref.nationality})</span>
                            )}
                          </div>
                          <span className="text-[#444] text-[10px]">{typeLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
