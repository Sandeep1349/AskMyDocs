export default function SourceBadge({ source, page, score, onOpen }) {
  const short = source.length > 30 ? "…" + source.slice(-27) : source
  return (
    <button
      onClick={() => onOpen?.(source, page)}
      title={page ? `${source} — page ${page}` : source}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                 bg-green-100 border border-green-300 text-green-700
                 text-xs font-medium truncate max-w-[200px]
                 hover:bg-green-200 hover:border-green-500 transition-colors cursor-pointer"
    >
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
      </svg>
      <span className="truncate">{short}</span>
      {page && <span className="text-green-500 shrink-0">p.{page}</span>}
      {score !== undefined && (
        <span className="text-green-400 shrink-0">{(score * 100).toFixed(0)}%</span>
      )}
    </button>
  )
}
