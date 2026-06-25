import { useState, useRef, useEffect } from "react"
import { askStreaming } from "../api"
import SourceBadge from "./SourceBadge"

function Message({ msg, isLastAssistant, loading }) {
  const isUser = msg.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50"
          }`}
        >
          {msg.text}
          {!isUser && isLastAssistant && loading && (
            <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
          )}
          {!isUser && !msg.text && isLastAssistant && loading && (
            <span className="text-slate-500 italic text-xs">Thinking…</span>
          )}
        </div>

        {msg.sources?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {msg.sources.map((s) => (
              <SourceBadge key={s} source={s} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const ask = async () => {
    const q = input.trim()
    if (!q || loading) return

    setInput("")
    setLoading(true)
    setError(null)

    // Optimistic: user message + empty assistant placeholder
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      { role: "assistant", text: "", sources: [] },
    ])

    await askStreaming(q, {
      onToken: (tok) =>
        setMessages((m) => {
          const msgs = [...m]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: msgs[msgs.length - 1].text + tok }
          return msgs
        }),
      onDone: (sources) => {
        setMessages((m) => {
          const msgs = [...m]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], sources }
          return msgs
        })
        setLoading(false)
        inputRef.current?.focus()
      },
      onError: (msg) => {
        setError(msg)
        setMessages((m) => m.slice(0, -1)) // remove empty placeholder
        setLoading(false)
      },
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      ask()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 font-medium">Ask anything about your documents</p>
              <p className="text-slate-500 text-sm mt-1">Upload a PDF or TXT file on the left, then start asking questions</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            msg={msg}
            isLastAssistant={msg.role === "assistant" && i === messages.length - 1}
            loading={loading}
          />
        ))}

        {error && (
          <p className="text-xs text-red-400 text-center px-4 py-2 bg-red-900/20 rounded-lg border border-red-800/30">
            Error: {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 py-4 border-t border-slate-800">
        <div className="flex gap-2 items-end bg-slate-800 rounded-2xl border border-slate-700/50
                        focus-within:border-indigo-600/60 transition-colors p-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none
                       outline-none min-h-[36px] max-h-[120px] py-1.5 px-2 leading-relaxed
                       disabled:opacity-50"
          />
          <button
            onClick={ask}
            disabled={loading || !input.trim()}
            className="shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                       disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Shift+Enter for new line · Enter to send · Answers grounded in your documents
        </p>
      </div>
    </div>
  )
}
