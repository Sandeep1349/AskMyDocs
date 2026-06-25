import ChatPanel from "./ChatPanel"
import PDFViewer from "./PDFViewer"

function AtomIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
      <ellipse cx="20" cy="20" rx="16" ry="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
      <ellipse cx="20" cy="20" rx="16" ry="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" transform="rotate(60 20 20)" />
      <ellipse cx="20" cy="20" rx="16" ry="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" transform="rotate(120 20 20)" />
    </svg>
  )
}

export default function ChatView({
  docs, selectedPdf, chats, onSaveMessages,
  onSelectPdf, onBack, onSourceOpen, viewingFile, onCloseViewer,
}) {
  const chatData    = chats[selectedPdf]
  const userMessages = chatData?.messages?.filter(m => m.role === "user") ?? []

  return (
    <div className="flex h-screen animate-gradient-bg overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-green-200/60 bg-white/75 backdrop-blur-md">

        {/* Gradient logo header */}
        <div className="relative overflow-hidden shrink-0 animate-sidebar-shimmer"
             style={{ background: "linear-gradient(135deg,#166534,#059669)" }}>
          <div className="relative z-10 flex items-center gap-3 px-5 py-5">
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" />
              <AtomIcon className="w-9 h-9 text-white" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-orbit"
                     style={{ boxShadow:"0 0 5px #6ee7b7" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   style={{ transform:"rotate(120deg)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-orbit-reverse" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wide">AskMyDocs</span>
              <p className="text-green-200 text-[10px] font-medium tracking-widest uppercase mt-0.5">AI Document Assistant</p>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border border-white/10 animate-spin-ring" />
          <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full border border-white/10 animate-spin-ring-slow" />
          <div className="absolute top-2 right-10 w-1.5 h-1.5 rounded-full bg-white/20 animate-sidebar-drift" />
          <div className="absolute bottom-2 right-6  w-1   h-1   rounded-full bg-white/15 animate-sidebar-drift" style={{ animationDelay:"3s" }} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-thin">

          {/* Document list */}
          <div>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2 px-1">Documents</p>
            <ul className="flex flex-col gap-0.5">
              {docs.map((d, i) => {
                const isActive   = d.filename === selectedPdf
                const hasHistory = !!chats[d.filename]?.messages?.length
                return (
                  <li key={d.filename} className="animate-item-in" style={{ animationDelay:`${i * 55}ms` }}>
                    <button
                      onClick={() => onSelectPdf(d.filename)}
                      className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-150
                        ${isActive
                          ? "border border-green-400/60 shadow-sm shadow-green-100 animate-active-glow"
                          : "hover:bg-green-50 border border-transparent"}`}
                      style={isActive ? { background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" } : {}}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0
                                       ${isActive ? "bg-green-200" : "bg-green-100"}`}>
                        <svg className={`w-3 h-3 ${isActive ? "text-green-700" : "text-green-500"}`}
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`text-xs truncate flex-1 ${isActive ? "text-green-800 font-bold" : "text-slate-600"}`}>
                        {d.filename}
                      </span>
                      {hasHistory && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Questions in this chat */}
          {userMessages.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2 px-1">This Chat</p>
              <div className="flex flex-col gap-1">
                {userMessages.map((m, i) => (
                  <div key={i}
                       className="px-3 py-1.5 rounded-xl border border-green-100 animate-item-in"
                       style={{ background: "linear-gradient(135deg,#f0fdf4,#f9fafb)", animationDelay:`${i * 50}ms` }}>
                    <p className="text-[11px] text-slate-600 truncate">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-green-200/70 bg-white/80 backdrop-blur-md">
          {/* Back button */}
          <button onClick={onBack} title="Back to dashboard"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                       text-green-700 hover:text-white border border-green-300 transition-all duration-200
                       hover:border-green-600 hover:shadow-md"
            style={{}}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { background:"linear-gradient(135deg,#16a34a,#059669)", color:"white" })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background:"", color:"" })}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* File icon */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-green-200"
               style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h1 className="text-sm font-bold text-slate-700 truncate flex-1">{selectedPdf}</h1>

          {/* View PDF */}
          <button onClick={() => onSourceOpen(selectedPdf, null)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                       bg-green-50 hover:bg-green-100 text-green-700 border border-green-300
                       transition-all duration-150">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View PDF
          </button>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <ChatPanel
            key={selectedPdf}
            filename={selectedPdf}
            initialMessages={chatData?.messages ?? []}
            onMessagesChange={(msgs) => onSaveMessages(selectedPdf, msgs)}
            onSourceOpen={onSourceOpen}
          />
        </main>
      </div>

      {viewingFile && (
        <PDFViewer filename={viewingFile.filename} page={viewingFile.page} onClose={onCloseViewer} />
      )}
    </div>
  )
}
