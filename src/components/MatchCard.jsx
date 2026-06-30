const MatchCard = ({ match, onClick }) => {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isDraw = isFinished && match.home.score === match.away.score;

  return (
    <div
      onClick={() => onClick?.(match)}
      className={`border font-mono text-sm transition-all duration-200 cursor-pointer ${
        isLive
          ? 'bg-[#081825] border-[#1565C0] hover:bg-[#0a2030] hover:border-[#1E88E5] hover:shadow-[0_0_20px_rgba(30,136,229,0.2)]'
          : 'bg-[#0a0a0a] border-[#222] hover:bg-[#111]'
      }`}
    >
      {/* Header */}
      <div className={`flex justify-between items-center px-3 py-1.5 border-b ${
        isLive ? 'bg-[#0c2235] border-[#1565C0]' : 'bg-[#111] border-[#222]'
      }`}>
        <span className="text-[#666] text-xs">{match.id}</span>
        <span className="text-[#444] text-xs">{match.stage}</span>
      </div>

      {/* Teams */}
      <div className="px-3 py-2 space-y-1">
        {/* Home */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{match.home.flag}</span>
            <span className={`font-bold ${match.home.pen > match.away.pen || (!isDraw && match.home.score > match.away.score) ? 'text-[#0f0]' : isFinished ? 'text-[#666]' : 'text-[#ccc]'}`}>
              {match.home.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFinished && (
              <>
                <span className={`font-bold ${!isDraw && match.home.score > match.away.score ? 'text-[#0f0]' : 'text-[#666]'}`}>
                  {match.home.score}
                </span>
                {match.home.pen !== undefined && match.home.pen !== null && (
                  <span className="text-[#444] text-xs">({match.home.pen})</span>
                )}
              </>
            )}
            {isLive && match.home.score !== undefined && match.home.score !== null && (
              <span className="font-bold text-[#fff]">{match.home.score}</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${isLive ? 'border-[#1a3a55]' : 'border-[#1a1a1a]'}`} />

        {/* Away */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{match.away.flag}</span>
            <span className={`font-bold ${match.away.pen > match.home.pen || (!isDraw && match.away.score > match.home.score) ? 'text-[#0f0]' : isFinished ? 'text-[#666]' : 'text-[#ccc]'}`}>
              {match.away.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFinished && (
              <>
                <span className={`font-bold ${!isDraw && match.away.score > match.home.score ? 'text-[#0f0]' : 'text-[#666]'}`}>
                  {match.away.score}
                </span>
                {match.away.pen !== undefined && match.away.pen !== null && (
                  <span className="text-[#444] text-xs">({match.away.pen})</span>
                )}
              </>
            )}
            {isLive && match.away.score !== undefined && match.away.score !== null && (
              <span className="font-bold text-[#fff]">{match.away.score}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex justify-between items-center px-3 py-1.5 border-t ${
        isLive ? 'bg-[#0c2235] border-[#1565C0]' : 'bg-[#111] border-[#222]'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-[#999] text-xs">{match.date}</span>
          {isFinished && (
            <span className="text-[#0f0] text-xs font-bold">FT</span>
          )}
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#42A5F5] rounded-full animate-pulse" />
              <span className="text-[#42A5F5] text-xs font-bold tabular-nums">
                {match.minute !== null && match.minute !== undefined
                  ? `${match.minute}:${String(match.second || 0).padStart(2, '0')}`
                  : 'LIVE'}
              </span>
            </div>
          )}
          {!isFinished && !isLive && (
            <span className="text-[#666] text-xs">{match.time}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(match);
          }}
          className="text-[#444] hover:text-[#0f0] text-xs transition-colors px-1"
          title="Detail Pertandingan"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
