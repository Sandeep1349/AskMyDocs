import { useState } from "react"

export default function ChatOptionsModal({ filename, onContinue, onNew, onCancel }) {
  const [confirming, setConfirming] = useState(false)
  const short = filename.length > 38 ? "…" + filename.slice(-35) : filename

  if (confirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-950/40 backdrop-blur-sm">
        <div className="bg-white border border-green-200 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl shadow-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">Delete Previous Chat?</h2>
              <p className="text-slate-500 text-sm mt-0.5">This cannot be undone</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Your previous conversation about{" "}
            <span className="text-slate-700 font-medium">"{short}"</span>{" "}
            will be permanently deleted.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-slate-700
                         text-sm transition-colors border border-green-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onNew}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white
                         text-sm font-semibold transition-colors"
            >
              Delete &amp; Start New
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-950/40 backdrop-blur-sm">
      <div className="bg-white border border-green-200 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl shadow-green-200">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-green-100 border border-green-300 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-slate-800 font-semibold">Open Document</h2>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{short}</p>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-5">
          You have a previous conversation for this document. Would you like to continue it or start a new one?
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onContinue}
            className="w-full px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white
                       text-sm font-semibold transition-colors flex items-center gap-2 justify-center
                       shadow-sm shadow-green-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Continue Previous Chat
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="w-full px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100 text-slate-700
                       text-sm font-medium transition-colors border border-green-200 flex items-center gap-2 justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
          <button
            onClick={onCancel}
            className="w-full px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
