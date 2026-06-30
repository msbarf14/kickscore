const MatchTable = ({ matches, onMatchClick }) => {
  if (!matches || matches.length === 0) return null;

  const scheduled = matches.filter(m => m.status === 'scheduled');
  const finished = matches.filter(m => m.status === 'finished');
  const hasBoth = scheduled.length > 0 && finished.length > 0;

  const renderRow = (match) => {
    const isScheduled = match.status === 'scheduled';
    const isFinished = match.status === 'finished';

    const isDraw = isFinished && match.home.score === match.away.score;
    const homeWin = !isDraw && match.home.score > match.away.score;
    const awayWin = !isDraw && match.away.score > match.home.score;

    return (
      <tr
        key={match.id || match.fixture_id}
        onClick={() => onMatchClick?.(match)}
        className={`border-b border-[#1a1a1a] transition-colors cursor-pointer ${
          isScheduled
            ? 'bg-[#1c1a0a] hover:bg-[#2a2810] border-l-2 border-l-[#ff0]'
            : 'hover:bg-[#111]'
        }`}
      >
        <td className="pl-2 pr-3 py-2 text-[#444] whitespace-nowrap">{match.date} {match.time}</td>
        <td className="pl-2 pr-0 py-2 text-right">
          <div className="flex items-center justify-end gap-1">
            <span className={`font-bold ${homeWin ? 'text-[#0f0]' : isFinished ? 'text-[#666]' : 'text-[#ccc]'}`}>
              {match.home.code}
            </span>
            <span>{match.home.flag}</span>
          </div>
        </td>
        <td className="px-1 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            {isFinished ? (
              <>
                <span className={`font-bold ${homeWin ? 'text-[#0f0]' : 'text-[#666]'}`}>
                  {match.home.score}
                </span>
                <span className="text-[#333]">-</span>
                <span className={`font-bold ${awayWin ? 'text-[#0f0]' : 'text-[#666]'}`}>
                  {match.away.score}
                </span>
                {match.home.pen !== undefined && match.home.pen !== null && (
                  <span className="text-[#444] text-[10px] ml-1">
                    ({match.home.pen}-{match.away.pen})
                  </span>
                )}
              </>
            ) : (
              <span className="text-[#555]">vs</span>
            )}
          </div>
        </td>
        <td className="pl-0 pr-2 py-2 text-left">
          <div className="flex items-center gap-1">
            <span>{match.away.flag}</span>
            <span className={`font-bold ${awayWin ? 'text-[#0f0]' : isFinished ? 'text-[#666]' : 'text-[#ccc]'}`}>
              {match.away.code}
            </span>
          </div>
        </td>
        <td className="px-3 py-2 text-center">
          {isScheduled && (
            <span className="text-[#ff0] font-bold">{match.time}</span>
          )}
          {isFinished && (
            <span className="text-[#0f0] font-bold">FT</span>
          )}
        </td>
        <td className="px-3 py-2 text-[#444]">{match.stage}</td>
        <td className="px-3 py-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMatchClick?.(match);
            }}
            className="text-[#444] hover:text-[#0f0] transition-colors"
            title="Detail Pertandingan"
          >
            ▶
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="border border-[#222] bg-[#0a0a0a] overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#111] border-b border-[#222]">
            <th className="pl-2 pr-3 py-2 text-left text-[#444] font-normal">TANGGAL</th>
            <th className="pl-2 pr-0 py-2 text-right text-[#444] font-normal">HOME</th>
            <th className="px-1 py-2 text-center text-[#444] font-normal">SKOR</th>
            <th className="pl-0 pr-2 py-2 text-left text-[#444] font-normal">AWAY</th>
            <th className="px-3 py-2 text-center text-[#444] font-normal">STATUS</th>
            <th className="px-3 py-2 text-left text-[#444] font-normal">STAGE</th>
            <th className="px-3 py-2 text-center text-[#444] font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {scheduled.length > 0 && (
            <tr>
              <td colSpan="7" className="p-0">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#ff0] to-transparent" />
              </td>
            </tr>
          )}
          {scheduled.map(renderRow)}
          {hasBoth && (
            <tr>
              <td colSpan="7" className="p-0">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#333] to-transparent" />
              </td>
            </tr>
          )}
          {finished.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;
