import { useState, useCallback } from "react"
import UploadPanel from "./components/UploadPanel"
import ChatPanel from "./components/ChatPanel"

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [uploadKey, setUploadKey] = useState(0)

  const handleUploaded = useCallback(() => {
    setUploadKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`shrink-0 flex flex-col border-r border-slate-800 bg-slate-900
                    transition-all duration-300 overflow-hidden
                    ${sidebarOpen ? "w-72" : "w-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-100 text-sm">AskMyDocs</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <UploadPanel key={uploadKey} onUploaded={handleUploaded} />
        </div>

        <div className="px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            RAG · bge-small-en · claude-haiku-4-5 · SSE streaming
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-slate-200">Document Q&A</h1>
          <span className="ml-auto text-xs text-slate-500">
            First token &lt;1s · Streaming answers
          </span>
        </header>

        {/* Chat */}
        <main className="flex-1 overflow-hidden">
          <ChatPanel key={uploadKey} />
        </main>
      </div>
    </div>
  )
}
