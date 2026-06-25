import { useState, useRef, useCallback } from "react"
import { uploadFile, listDocuments, deleteDocument } from "../api"

export default function UploadPanel({ onUploaded, onOpenFile }) {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
  const inputRef = useRef()

  const refreshDocs = useCallback(async () => {
    try {
      const data = await listDocuments()
      setDocs(data.documents ?? [])
    } catch {
      // silently ignore
    }
  }, [])

  useState(() => { refreshDocs() }, [])

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
      await refreshDocs()
      onUploaded?.()
    } catch (e) {
      setStatus({ type: "error", msg: e.message })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename) => {
    try {
      await deleteDocument(filename)
      await refreshDocs()
      onUploaded?.()
    } catch (e) {
      setStatus({ type: "error", msg: e.message })
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Documents</h2>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
          ${dragOver
            ? "border-indigo-500 bg-indigo-900/20"
            : "border-slate-700 hover:border-indigo-600 hover:bg-slate-800/50"
          }
          ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Ingesting…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm">Drop PDF or TXT, or <span className="text-indigo-400">click to browse</span></span>
          </div>
        )}
      </div>

      {/* Status message */}
      {status && (
        <p className={`text-xs px-3 py-2 rounded-lg ${
          status.type === "success"
            ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50"
            : "bg-red-900/40 text-red-400 border border-red-800/50"
        }`}>
          {status.msg}
        </p>
      )}

      {/* Document list */}
      {docs.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {docs.map((doc) => (
            <li
              key={doc.filename}
              className="flex items-center justify-between gap-2 px-3 py-2
                         bg-slate-800/60 rounded-lg border border-slate-700/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 truncate">{doc.filename}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onOpenFile?.(doc.filename)}
                  title="View document"
                  className="text-slate-600 hover:text-indigo-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(doc.filename)}
                  title="Remove document"
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {docs.length === 0 && !uploading && (
        <p className="text-xs text-slate-600 text-center">No documents yet</p>
      )}
    </div>
  )
}
