import { useState, useCallback } from "react"

const KEY = "askmydocs:chats"

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") }
  catch { return {} }
}

export function useChats() {
  const [chats, setChats] = useState(load)

  const saveMessages = useCallback((filename, messages) => {
    setChats(prev => {
      const next = { ...prev, [filename]: { messages, lastUpdated: new Date().toISOString() } }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearChat = useCallback((filename) => {
    setChats(prev => {
      const next = { ...prev }
      delete next[filename]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { chats, saveMessages, clearChat }
}
