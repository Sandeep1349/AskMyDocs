import { useEffect } from "react"
import { getDocumentFileUrl } from "../api"

export default function PDFViewer({ filename, page, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const base = getDocumentFileUrl(filename)
  const src = page ? `${base}#page=${page}` : base

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-green-50">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-green-200 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm text-slate-700 font-medium truncate">{filename}</span>
          {page && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 border border-green-300
                             text-green-700 text-xs font-semibold">
              Page {page}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-900
                     text-sm transition-colors border border-green-300 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
      </div>

      <iframe
        key={src}
        src={src}
        className="flex-1 w-full border-0"
        title={filename}
      />
    </div>
  )
}
