const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export async function uploadFile(file) {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function askStreaming(question, { onToken, onDone, onError, top_k = 4 }) {
  let res
  try {
    res = await fetch(`${BASE}/query/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k }),
    })
  } catch (err) {
    onError?.(err.message)
    return
  }

  if (!res.ok) {
    onError?.(await res.text())
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const parts = buf.split("\n\n")
    buf = parts.pop()
    for (const part of parts) {
      if (!part.startsWith("data: ")) continue
      try {
        const msg = JSON.parse(part.slice(6))
        if (msg.token) onToken(msg.token)
        if (msg.done) onDone(msg.sources ?? [])
      } catch {
        // malformed SSE frame — skip
      }
    }
  }
}

export async function askQuestion(question, top_k = 4) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, top_k }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function listDocuments() {
  const res = await fetch(`${BASE}/documents`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteDocument(filename) {
  const res = await fetch(`${BASE}/documents/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function clearCache() {
  const res = await fetch(`${BASE}/cache`, { method: "DELETE" })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
