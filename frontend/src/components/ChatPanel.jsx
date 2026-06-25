import { useState, useRef, useEffect, useCallback } from "react"
import { askStreaming } from "../api"
import SourceBadge from "./SourceBadge"

/* ── Animated typing indicator ── */
function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-0.5">
      {[0, 150, 300].map((delay, i) => (
        <div key={i}
             className="w-2 h-2 rounded-full animate-bounce-dot"
             style={{
               animationDelay: `${delay}ms`,
               background: `hsl(${142 + i * 8}, 72%, ${48 + i * 4}%)`,
             }} />
      ))}
    </div>
  )
}

/* ── Empty state atom ── */
function AtomOrbit() {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center animate-float">
      <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-spin-ring" />
      <div className="absolute inset-3 rounded-full border-[1.5px] border-green-300 animate-spin-ring-slow" />
      <div className="absolute inset-6 rounded-full border border-green-400 animate-spin-ring" style={{ animationDuration:"4s" }} />
      <div className="w-8 h-8 rounded-full animate-glow-pulse flex items-center justify-center"
           style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-md shadow-green-300 animate-orbit-wide" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform:"rotate(120deg)" }}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-orbit-reverse" />
      </div>
      <div className="absolute inset-0 rounded-full animate-pulse-ring"
           style={{ background:"rgba(34,197,94,0.2)" }} />
    </div>
  )
}

/* ── AI avatar ── */
function AIAvatar() {
  return (
    <div className="relative w-9 h-9 shrink-0 mt-0.5 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full animate-pulse-ring"
           style={{ background:"rgba(34,197,94,0.25)", animationDuration:"2.8s" }} />
      <div className="w-9 h-9 rounded-full flex items-center justify-center z-10 shadow-md"
           style={{ background:"linear-gradient(135deg,#16a34a,#059669)" }}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      {/* orbiting electron */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-300 animate-orbit z-20"
             style={{ boxShadow:"0 0 4px #6ee7b7" }} />
      </div>
    </div>
  )
}

/* ── User avatar ── */
function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-full border-2 border-green-300 flex items-center justify-center
                    shrink-0 mt-0.5 shadow-sm"
         style={{ background:"linear-gradient(135deg,#dcfce7,#bbf7d0)" }}>
      <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  )
}

/* ── Single message ── */
function Message({ msg, isLastAssistant, loading, onSourceOpen }) {
  const isUser = msg.role === "user"
  const isTyping = !isUser && isLastAssistant && loading && !msg.text

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end animate-slide-right" : "justify-start animate-slide-left"}`}>
      {!isUser && <AIAvatar />}

      <div className={`max-w-[78%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? "text-white rounded-br-sm shadow-lg"
            : "bg-white/90 backdrop-blur-sm text-slate-800 rounded-bl-sm border border-green-200/80 shadow-sm shadow-green-100"}`}
          style={isUser ? {
            background: "linear-gradient(135deg,#16a34a,#059669)",
            boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
          } : {}}
        >
          {isTyping ? (
            <TypingDots />
          ) : (
            <>
              {msg.text}
              {!isUser && isLastAssistant && loading && msg.text && (
                <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-pulse align-middle rounded-full" />
              )}
            </>
          )}
        </div>

        {msg.sources?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap animate-fade-up">
            {msg.sources.map((s, i) => (
              <SourceBadge key={i}
                source={typeof s === "string" ? s : s.source}
                page={s.page} score={s.score} onOpen={onSourceOpen} />
            ))}
          </div>
        )}
      </div>

      {isUser && <UserAvatar />}
    </div>
  )
}

export default function ChatPanel({ filename, initialMessages = [], onMessagesChange, onSourceOpen }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const updateMessages = useCallback((updater) => {
    setMessages(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater
      onMessagesChange?.(next)
      return next
    })
  }, [onMessagesChange])

  const ask = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput("")
    setLoading(true)
    setError(null)

    updateMessages(m => [
      ...m,
      { role: "user", text: q },
      { role: "assistant", text: "", sources: [] },
    ])

    await askStreaming(q, {
      filename,
      onToken: (tok) =>
        updateMessages(m => {
          const msgs = [...m]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: msgs[msgs.length - 1].text + tok }
          return msgs
        }),
      onDone: (sources) => {
        updateMessages(m => {
          const msgs = [...m]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], sources }
          return msgs
        })
        setLoading(false)
        inputRef.current?.focus()
      },
      onError: (msg) => {
        setError(msg)
        updateMessages(m => m.slice(0, -1))
        setLoading(false)
      },
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask() }
  }

  return (
    <div className="flex flex-col h-full"
         style={{ background: "linear-gradient(180deg,rgba(240,253,244,0.6) 0%,rgba(255,255,255,0.85) 100%)" }}>

      {/* dot-grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: "radial-gradient(circle,rgba(22,163,74,0.08) 1px,transparent 1px)",
             backgroundSize: "28px 28px",
           }} />

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin px-5 py-6 flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-fade-up">
            <AtomOrbit />
            <div>
              <p className="text-slate-700 font-extrabold text-xl text-gradient">Ask anything</p>
              <p className="text-slate-400 text-sm mt-1.5 max-w-xs">
                Powered by AI · Grounded in{" "}
                <span className="text-green-600 font-semibold">{filename ?? "your document"}</span>
              </p>
            </div>
            {/* hint chips */}
            <div className="flex gap-2 flex-wrap justify-center mt-1">
              {["Summarize this", "Key takeaways", "Explain the main topic"].map(hint => (
                <button key={hint} onClick={() => { setInput(hint); inputRef.current?.focus() }}
                  className="text-xs px-3 py-1.5 rounded-full bg-green-50 border border-green-200
                             text-green-700 hover:bg-green-100 hover:border-green-400 transition-all duration-150
                             font-medium">
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg}
            isLastAssistant={msg.role === "assistant" && i === messages.length - 1}
            loading={loading} onSourceOpen={onSourceOpen} />
        ))}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 px-4 py-3
                          bg-red-50 rounded-2xl border border-red-200 animate-fade-up">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="relative z-10 shrink-0 px-5 py-4 border-t border-green-200/70 bg-white/80 backdrop-blur-md">
        <div className="flex gap-3 items-end bg-white rounded-2xl border border-green-300
                        focus-within:border-green-500 focus-within:shadow-md focus-within:shadow-green-200/50
                        transition-all duration-200 p-2 pl-4">
          <textarea
            ref={inputRef} rows={1} value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${filename ?? "the document"}…`}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none
                       outline-none min-h-[36px] max-h-[120px] py-1.5 leading-relaxed disabled:opacity-50"
          />
          <button onClick={ask} disabled={loading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-xl text-white flex items-center justify-center
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#16a34a,#059669)",
              boxShadow: loading || !input.trim() ? "none" : "0 4px 14px rgba(22,163,74,0.45)",
            }}>
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}
