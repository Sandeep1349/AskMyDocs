import { useRef, useState } from "react"
import { uploadFile, deleteDocument } from "../api"

/* ── Shared atom SVG ── */
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

/* ── Giant watermark atom that rotates slowly in the background ── */
function WatermarkAtom() {
  return (
    <div className="absolute -right-24 -bottom-24 pointer-events-none select-none animate-spin-very-slow" style={{ opacity: 0.045 }}>
      <svg viewBox="0 0 500 500" fill="none" className="w-[520px] h-[520px] text-green-700">
        <circle cx="250" cy="250" r="28" fill="currentColor" />
        <ellipse cx="250" cy="250" rx="220" ry="75" stroke="currentColor" strokeWidth="3" />
        <ellipse cx="250" cy="250" rx="220" ry="75" stroke="currentColor" strokeWidth="3" transform="rotate(60 250 250)" />
        <ellipse cx="250" cy="250" rx="220" ry="75" stroke="currentColor" strokeWidth="3" transform="rotate(120 250 250)" />
        <circle cx="470" cy="250" r="8" fill="currentColor" />
        <circle cx="250" cy="30"  r="6" fill="currentColor" />
        <circle cx="30"  cy="250" r="7" fill="currentColor" />
      </svg>
    </div>
  )
}

/* ── Floating particle ── */
function Particle({ style, reverse }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${reverse ? "animate-drift2" : "animate-drift"}`}
      style={style}
    />
  )
}

/* ── Trash icon ── */
function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export default function Dashboard({ docs, chats, onSelectPdf, onUploaded, onDeleteChat }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus]   = useState(null)
  const inputRef = useRef()

  const handleFiles = async (files) => {
    const file = files[0]
    if (!file) return
    if (!file.name.match(/\.(pdf|txt)$/i)) {
      setStatus({ type: "error", msg: "Only PDF and TXT files are supported." })
      return
    }
    setUploading(true)
    setStatus(null)
    try {
      const result = await uploadFile(file)
      setStatus({ type: "success", msg: `"${result.filename}" uploaded successfully` })
      await onUploaded()
    } catch (e) {
      setStatus({ type: "error", msg: e.message })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = async (filename) => {
    try {
      await deleteDocument(filename)
      onDeleteChat(filename)
      await onUploaded()
    } catch (e) {
      setStatus({ type: "error", msg: e.message })
    }
  }

  const recentChats = Object.entries(chats)
    .filter(([, c]) => c.messages?.length > 0)
    .sort(([, a], [, b]) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 8)

  return (
    <div className="flex h-screen animate-gradient-bg overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-green-200/60 bg-white/75 backdrop-blur-md overflow-y-auto">

        {/* Logo — gradient header */}
        <div className="relative overflow-hidden shrink-0 animate-sidebar-shimmer"
             style={{ background: "linear-gradient(135deg,#166534,#059669)" }}>
          <div className="relative z-10 flex items-center gap-3 px-5 py-5">
            {/* Atom with orbiting electrons */}
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" />
              <AtomIcon className="w-9 h-9 text-white" />
              {/* electron 1 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-orbit"
                     style={{ boxShadow:"0 0 5px #6ee7b7" }} />
              </div>
              {/* electron 2 */}
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
          {/* decorative rings */}
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border border-white/10 animate-spin-ring" />
          <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full border border-white/10 animate-spin-ring-slow" />
          {/* micro-particles */}
          <div className="absolute top-2 right-10 w-1.5 h-1.5 rounded-full bg-white/20 animate-sidebar-drift" />
          <div className="absolute bottom-2 right-6  w-1   h-1   rounded-full bg-white/15 animate-sidebar-drift" style={{ animationDelay:"2.5s" }} />
        </div>

        <div className="flex-1 p-4 flex flex-col gap-5">
          {/* Documents */}
          <div>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2 px-1">Documents</p>
            {docs.length === 0 ? (
              <p className="text-xs text-slate-400 px-2 py-1">No documents yet</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {docs.map((doc, i) => (
                  <li key={doc.filename} className="group flex items-center gap-1 animate-item-in"
                      style={{ animationDelay:`${i * 55}ms` }}>
                    <button
                      onClick={() => onSelectPdf(doc.filename)}
                      className="flex-1 text-left flex items-center gap-2 px-2 py-2 rounded-xl
                                 hover:bg-green-50 transition-all duration-150 min-w-0"
                    >
                      <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-slate-600 truncate flex-1">{doc.filename}</span>
                      {chats[doc.filename]?.messages?.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                      )}
                    </button>
                    <button onClick={() => handleDeleteDoc(doc.filename)} title="Delete document"
                      className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50
                                 transition-colors opacity-0 group-hover:opacity-100">
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Chats */}
          {recentChats.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2 px-1">Recent Chats</p>
              <ul className="flex flex-col gap-0.5">
                {recentChats.map(([filename, chat], i) => {
                  const lastQ = chat.messages?.filter(m => m.role === "user").pop()
                  return (
                    <li key={filename} className="group flex items-start gap-1 animate-item-in"
                        style={{ animationDelay:`${i * 60}ms` }}>
                      <button onClick={() => onSelectPdf(filename)}
                        className="flex-1 text-left px-2 py-2 rounded-xl hover:bg-green-50 transition-all min-w-0">
                        <p className="text-xs text-slate-700 font-medium truncate">{filename}</p>
                        {lastQ && <p className="text-[11px] text-slate-400 truncate mt-0.5">"{lastQ.text}"</p>}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(filename) }} title="Delete chat"
                        className="shrink-0 mt-1.5 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50
                                   transition-colors opacity-0 group-hover:opacity-100">
                        <TrashIcon />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">

        {/* Floating background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <Particle style={{ width:10,height:10, top:"8%",  left:"15%", background:"#86efac", animationDelay:"0s",    animationDuration:"9s"  }} />
          <Particle style={{ width:6, height:6,  top:"20%", left:"68%", background:"#6ee7b7", animationDelay:"2s",    animationDuration:"12s" }} reverse />
          <Particle style={{ width:14,height:14, top:"50%", left:"80%", background:"#a7f3d0", animationDelay:"1s",    animationDuration:"8s"  }} />
          <Particle style={{ width:7, height:7,  top:"72%", left:"22%", background:"#86efac", animationDelay:"3.5s",  animationDuration:"10s" }} reverse />
          <Particle style={{ width:5, height:5,  top:"35%", left:"48%", background:"#6ee7b7", animationDelay:"1.8s",  animationDuration:"13s" }} />
          <Particle style={{ width:9, height:9,  top:"85%", left:"58%", background:"#bbf7d0", animationDelay:"0.5s",  animationDuration:"7s"  }} reverse />
          <Particle style={{ width:4, height:4,  top:"60%", left:"38%", background:"#34d399", animationDelay:"4s",    animationDuration:"11s" }} />
          <Particle style={{ width:8, height:8,  top:"15%", left:"88%", background:"#a7f3d0", animationDelay:"2.5s",  animationDuration:"9s"  }} reverse />
        </div>

        {/* Watermark atom */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <WatermarkAtom />
        </div>

        {/* Header */}
        <header className="relative z-10 shrink-0 px-8 pt-8 pb-7 border-b border-green-200/70 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* animated atom icon */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full animate-pulse-ring"
                   style={{ background: "rgba(34,197,94,0.25)" }} />
              <div className="absolute inset-0 rounded-full animate-pulse-ring"
                   style={{ background: "rgba(34,197,94,0.15)", animationDelay: "0.6s" }} />
              <div className="w-14 h-14 rounded-full flex items-center justify-center animate-glow-pulse"
                   style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}>
                <AtomIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gradient">Your Documents</h1>
              <p className="text-slate-500 text-sm mt-0.5">Upload a document and start asking questions instantly</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 flex flex-col gap-8 relative z-10">

          {/* Upload zone */}
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
            className={`relative overflow-hidden rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
              border-2 border-dashed
              ${dragOver
                ? "border-green-500 bg-green-100/70 scale-[1.01]"
                : "border-green-300/80 hover:border-green-500 bg-white/60 hover:bg-green-50/70"}
              ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {/* corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500 rounded-br-2xl" />

            <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden"
              onChange={(e) => handleFiles(e.target.files)} />

            {uploading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-[3px] border-green-100 animate-spin-ring" />
                  <div className="absolute inset-2 rounded-full border-[3px] border-green-300 border-t-transparent animate-spin" />
                  <div className="absolute inset-4 rounded-full border-2 border-green-500 border-b-transparent animate-spin-ring-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-green-700 text-sm font-semibold">Processing document…</p>
                  <p className="text-green-500 text-xs mt-0.5">Embedding and indexing content</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-20 h-20 animate-float">
                  {/* outer orbit ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-spin-ring" />
                  <div className="absolute inset-2 rounded-full border border-green-300 animate-spin-ring-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-50
                                    border-2 border-green-300 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  {/* orbiting electron */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-md shadow-green-300 animate-orbit" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(180deg)" }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-orbit-reverse" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-700 text-base font-bold">Drop a PDF or TXT here</p>
                  <p className="text-slate-400 text-sm mt-1">
                    or <span className="text-green-600 font-semibold underline underline-offset-2">click to browse</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          {status && (
            <div className={`text-sm px-4 py-3 rounded-2xl border flex items-center gap-2.5 animate-fade-up ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-red-50 text-red-600 border-red-200"
            }`}>
              <div className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
                status.type === "success" ? "bg-green-500" : "bg-red-500"
              }`} />
              {status.msg}
            </div>
          )}

          {/* Document grid */}
          {docs.length > 0 && (
            <div>
              {/* Animated section heading */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-green-200" />
                <div className="flex items-center gap-2">
                  {/* tiny spinning atom next to heading */}
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border border-green-400 animate-spin-ring" />
                    <div className="absolute inset-[3px] rounded-full bg-green-500" />
                  </div>
                  <h2 className="text-xs font-bold text-green-700 uppercase tracking-widest">
                    All Documents ({docs.length})
                  </h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-green-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {docs.map((doc, idx) => {
                  const chat     = chats[doc.filename]
                  const msgCount = chat?.messages?.length ?? 0
                  const hasChat  = msgCount > 0
                  const excCount = Math.floor(msgCount / 2)
                  const lastDate = chat?.lastUpdated
                    ? new Date(chat.lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : null
                  const lastQ = chat?.messages?.filter(m => m.role === "user").pop()

                  return (
                    <div key={doc.filename}
                         className="card-shine-hover relative bg-white/80 backdrop-blur-sm border border-green-200
                                    rounded-2xl p-5 flex flex-col gap-4 animate-fade-up
                                    hover:border-green-400 hover:shadow-xl hover:shadow-green-100/60
                                    hover:-translate-y-1 transition-all duration-200"
                         style={{ animationDelay: `${idx * 80}ms` }}>
                      {/* animated top accent line */}
                      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                           style={{ background: "linear-gradient(90deg,transparent,#16a34a,transparent)",
                                    animation: "gradient-shift 4s ease infinite",
                                    backgroundSize: "200% 100%" }} />

                      <div className="flex items-start gap-3">
                        {/* Document icon with orbiting electron */}
                        <div className="relative w-11 h-11 shrink-0">
                          {hasChat && (
                            <div className="absolute inset-0 rounded-xl animate-pulse-ring"
                                 style={{ background: "rgba(34,197,94,0.18)" }} />
                          )}
                          <div className="w-11 h-11 rounded-xl border border-green-200 flex items-center justify-center"
                               style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          {/* orbiting electron */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-orbit"
                                 style={{ boxShadow:"0 0 4px #86efac", animationDelay:`${idx * 0.4}s` }} />
                          </div>
                          {hasChat && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-slate-800 text-sm font-bold truncate leading-tight" title={doc.filename}>
                            {doc.filename}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {hasChat ? `${excCount} exchange${excCount !== 1 ? "s" : ""}` : "Ready to chat"}
                          </p>
                        </div>
                      </div>

                      {hasChat ? (
                        <div className="px-3 py-2.5 rounded-xl border border-green-200"
                             style={{ background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)" }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-green-700 font-bold uppercase tracking-wide flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                              Last session
                            </span>
                            <span className="text-[10px] text-slate-400">{lastDate}</span>
                          </div>
                          {lastQ && <p className="text-xs text-slate-500 truncate italic">"{lastQ.text}"</p>}
                        </div>
                      ) : (
                        <div className="px-3 py-2.5 rounded-xl border border-dashed border-green-200 flex items-center gap-2"
                             style={{ background: "linear-gradient(135deg,#f9fafb,#f0fdf4)" }}>
                          {/* three bouncing dots */}
                          <div className="flex gap-1">
                            {[0,1,2].map(d => (
                              <div key={d} className="w-1.5 h-1.5 rounded-full bg-green-300 animate-bounce-dot"
                                   style={{ animationDelay:`${d*150}ms` }} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">No conversations yet</p>
                        </div>
                      )}

                      {/* Button with animated glow ring */}
                      <div className="relative mt-auto">
                        <div className="absolute inset-0 rounded-xl animate-pulse-ring"
                             style={{ background:"rgba(22,163,74,0.25)", animationDuration:"2.5s" }} />
                        <button
                          onClick={() => onSelectPdf(doc.filename)}
                          className="relative w-full py-2.5 rounded-xl text-white text-sm font-bold
                                     transition-all duration-200 flex items-center justify-center gap-2
                                     hover:scale-[1.03] active:scale-95"
                          style={{ background: "linear-gradient(135deg,#16a34a,#059669)",
                                   boxShadow: "0 4px 14px rgba(22,163,74,0.4)" }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {hasChat ? "Continue Chat" : "Start Chat"}
                      </button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {docs.length === 0 && !uploading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-8 text-center py-20">
              <div className="relative w-32 h-32">
                {/* rings */}
                <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-spin-ring" />
                <div className="absolute inset-3 rounded-full border-2 border-green-300 animate-spin-ring-slow" />
                <div className="absolute inset-6 rounded-full border border-green-400 animate-spin-ring" style={{ animationDuration: "5s" }} />
                {/* nucleus */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full animate-glow-pulse flex items-center justify-center"
                       style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}>
                    <AtomIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                {/* electrons */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-300 animate-orbit-wide" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(120deg)" }}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-orbit" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(240deg)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-orbit-reverse" />
                </div>
                {/* pulse halos */}
                <div className="absolute inset-0 rounded-full animate-pulse-ring"
                     style={{ background: "rgba(34,197,94,0.15)" }} />
                <div className="absolute inset-0 rounded-full animate-pulse-ring"
                     style={{ background: "rgba(34,197,94,0.1)", animationDelay: "0.9s" }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gradient">Ready to Explore</p>
                <p className="text-slate-400 text-sm mt-2">Upload a PDF or TXT file above to get started</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
