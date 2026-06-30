import { useState, useEffect, useCallback, useMemo } from 'react';
import MatchCard from './components/MatchCard';
import MatchTable from './components/MatchTable';
import MatchDetailModal from './components/MatchDetailModal';
import TrophyLogo from './components/TrophyLogo';
import { FilterIcon, SyncIcon, LoadingIcon, PlayIcon, CalendarIcon, CheckIcon, ClockIcon, FireIcon } from './components/Icons';
import { useMatches, useSync, useStatus } from './hooks/useMatches';
import matches from './data/matches';

const STAGE_GROUPS = [
  { key: 'all', label: 'SEMUA' },
  { key: 'GROUP', label: 'GRUP' },
  { key: 'LAST_32', label: '32 BESAR' },
  { key: '16 BESAR', label: '16 BESAR' },
  { key: 'PEREMPAT FINAL', label: 'PEREMPAT FINAL' },
  { key: 'SEMIFINAL', label: 'SEMIFINAL' },
  { key: 'FINAL', label: 'FINAL' }
];

function App() {
  const [selectedDetailMatch, setSelectedDetailMatch] = useState(null);
  const [useApi, setUseApi] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const { matches: apiMatches, loading, error, refetch } = useMatches();
  const { syncing, syncMatches } = useSync();
  const { status } = useStatus();

  useEffect(() => {
    if (status && status.server === 'running' && status.hasApiKey) {
      setUseApi(true);
    }
  }, [status]);

  const displayMatches = useApi ? apiMatches : matches;

  const filteredMatches = useMemo(() => {
    if (stageFilter === 'all') return displayMatches;
    if (stageFilter === 'GROUP') {
      return displayMatches.filter(m => m.stage?.startsWith('GROUP'));
    }
    return displayMatches.filter(m => m.stage === stageFilter);
  }, [displayMatches, stageFilter]);

  const liveMatches = filteredMatches.filter(m => m.status === 'live');
  const scheduledMatches = filteredMatches.filter(m => m.status === 'scheduled');
  const finishedMatches = filteredMatches.filter(m => m.status === 'finished');
  const tableMatches = [...scheduledMatches, ...finishedMatches];

  const stageCounts = useMemo(() => {
    const counts = { all: displayMatches.length };
    counts.GROUP = displayMatches.filter(m => m.stage?.startsWith('GROUP')).length;
    counts.LAST_32 = displayMatches.filter(m => m.stage === 'LAST_32').length;
    counts['16 BESAR'] = displayMatches.filter(m => m.stage === '16 BESAR').length;
    counts['PEREMPAT FINAL'] = displayMatches.filter(m => m.stage === 'PEREMPAT FINAL').length;
    counts.SEMIFINAL = displayMatches.filter(m => m.stage === 'SEMIFINAL').length;
    counts.FINAL = displayMatches.filter(m => m.stage === 'FINAL' || m.stage === 'TEMPAT KETIGA').length;
    return counts;
  }, [displayMatches]);

  const handleMatchClick = useCallback((match) => {
    setSelectedDetailMatch(match);
  }, []);

  const handleSync = useCallback(async () => {
    try {
      setSyncMessage('Syncing...');
      const result = await syncMatches();
      if (result.success) {
        setSyncMessage(`Synced ${result.synced} matches`);
        refetch();
      } else {
        setSyncMessage('Sync failed');
      }
    } catch (err) {
      setSyncMessage(`Error: ${err.message}`);
    }
    setTimeout(() => setSyncMessage(''), 3000);
  }, [syncMatches, refetch]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ccc] p-4 sm:p-6 font-mono">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <TrophyLogo className="w-10 h-10 sm:w-14 sm:h-14" />
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-[#ccc] tracking-wider leading-tight">WORLD CUP</h1>
              <p className="text-[#444] text-xs sm:text-sm">2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${useApi ? 'text-[#ff6600]' : 'text-[#555]'}`} title={useApi ? 'API Connected' : 'API Disconnected'}>
              <FireIcon size={18} />
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-1.5 text-[#888] hover:text-[#ccc] bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] rounded transition-all duration-200 disabled:opacity-50"
              title="Sync data"
            >
              <SyncIcon size={16} className={syncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Controls */}
      <div className="max-w-5xl mx-auto mb-6 space-y-[2px]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[2px]">
          <div className="bg-[#0a0a0a] border border-[#222] px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-0.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 text-[#444]">
              <CalendarIcon size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[10px] sm:text-xs">TOTAL</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-[#ccc]">{filteredMatches.length}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-0.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 text-[#f00]">
              <PlayIcon size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[10px] sm:text-xs">LIVE</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-[#f00]">{liveMatches.length}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-0.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 text-[#ff0]">
              <ClockIcon size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[10px] sm:text-xs">JADWAL</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-[#ff0]">{scheduledMatches.length}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-0.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 text-[#0f0]">
              <CheckIcon size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[10px] sm:text-xs">SELESAI</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-[#0f0]">{finishedMatches.length}</span>
          </div>
        </div>

        {syncMessage && (
          <div className="text-center py-1">
            <span className="text-[#444] text-xs">{syncMessage}</span>
          </div>
        )}

        {useApi && loading && (
          <div className="text-center py-2">
            <LoadingIcon size={14} className="text-[#0f0]" />
            <span className="text-[#444] text-xs ml-2">Loading from API...</span>
          </div>
        )}

        {useApi && error && (
          <div className="text-center py-2">
            <span className="text-[#f00] text-xs">Error: {error}</span>
            <span className="text-[#444] text-xs ml-2">Using fallback data</span>
          </div>
        )}
      </div>

      {/* Live Matches - Grid */}
      {liveMatches.length > 0 && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-2">
            <PlayIcon size={16} className="text-[#f00]" />
            <span className="text-[#f00] text-xs font-bold uppercase tracking-wider">Sedang Berlangsung</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]">
            {liveMatches.map((match) => (
              <MatchCard
                key={match.id || match.fixture_id}
                match={match}
                onClick={handleMatchClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stage Filter + Table */}
      {tableMatches.length > 0 && (
        <div className="max-w-5xl mx-auto">
          {/* Stage Filter */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-[2px]">
              {STAGE_GROUPS.map(sg => (
                <button
                  key={sg.key}
                  onClick={() => setStageFilter(sg.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-all duration-200 ${
                    stageFilter === sg.key
                      ? 'bg-[#1a1a1a] border-[#0f0] text-[#0f0]'
                      : 'bg-[#0a0a0a] border-[#222] text-[#666] hover:bg-[#111] hover:text-[#ccc]'
                  }`}
                >
                  <FilterIcon size={12} />
                  {sg.label} ({stageCounts[sg.key] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <MatchTable matches={tableMatches} onMatchClick={handleMatchClick} />
        </div>
      )}

      {/* Empty State */}
      {liveMatches.length === 0 && tableMatches.length === 0 && (
        <div className="max-w-5xl mx-auto text-center py-12">
          <p className="text-[#444] text-sm">Tidak ada pertandingan</p>
        </div>
      )}

      {/* Legend */}
      <div className="max-w-5xl mx-auto mt-6">
        <div className="border border-[#222] bg-[#0a0a0a] px-4 py-2 flex flex-wrap gap-6 text-xs">
          <div className="flex items-center gap-2">
            <PlayIcon size={14} className="text-[#f00] animate-pulse" />
            <span className="text-[#444]">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon size={14} className="text-[#ff0]" />
            <span className="text-[#444]">Akan Berlangsung</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon size={14} className="text-[#0f0]" />
            <span className="text-[#444]">Selesai</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[#333] text-xs">Click row or ▶ for details</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto mt-4 text-center">
        <span className="text-[#333] text-xs">&copy; FIFA World Cup 2026</span>
      </div>

      {/* Match Detail Modal */}
      {selectedDetailMatch && (
        <MatchDetailModal
          match={selectedDetailMatch}
          onClose={() => setSelectedDetailMatch(null)}
        />
      )}
    </div>
  );
}

export default App;
