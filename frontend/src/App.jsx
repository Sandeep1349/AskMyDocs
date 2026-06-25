import { useState, useCallback, useEffect } from "react"
import Dashboard from "./components/Dashboard"
import ChatView from "./components/ChatView"
import ChatOptionsModal from "./components/ChatOptionsModal"
import { listDocuments } from "./api"
import { useChats } from "./hooks/useChats"

export default function App() {
  const [docs, setDocs] = useState([])
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [pendingPdf, setPendingPdf] = useState(null)
  const [viewingFile, setViewingFile] = useState(null) // { filename, page } | null
  const { chats, saveMessages, clearChat } = useChats()

  const refreshDocs = useCallback(async () => {
    try {
      const data = await listDocuments()
      setDocs(data.documents ?? [])
    } catch {}
  }, [])

  useEffect(() => { refreshDocs() }, [refreshDocs])

  // Called whenever a PDF is selected (from dashboard card, sidebar, or source badge)
  const handleSelectPdf = useCallback((filename) => {
    if (filename === selectedPdf) return
    const hasHistory = !!(chats[filename]?.messages?.length)
    if (hasHistory) {
      setPendingPdf(filename) // show continue/new modal
    } else {
      setSelectedPdf(filename) // go straight to chat
    }
  }, [chats, selectedPdf])

  const handleNewChat = useCallback(() => {
    clearChat(pendingPdf)
    setSelectedPdf(pendingPdf)
    setPendingPdf(null)
  }, [pendingPdf, clearChat])

  const handleContinueChat = useCallback(() => {
    setSelectedPdf(pendingPdf)
    setPendingPdf(null)
  }, [pendingPdf])

  const handleSourceOpen = useCallback((filename, page) => {
    setViewingFile({ filename, page: page ?? null })
  }, [])

  return (
    <>
      {selectedPdf ? (
        <ChatView
          docs={docs}
          selectedPdf={selectedPdf}
          chats={chats}
          onSaveMessages={saveMessages}
          onSelectPdf={handleSelectPdf}
          onBack={() => setSelectedPdf(null)}
          onUploaded={refreshDocs}
          onSourceOpen={handleSourceOpen}
          viewingFile={viewingFile}
          onCloseViewer={() => setViewingFile(null)}
        />
      ) : (
        <Dashboard
          docs={docs}
          chats={chats}
          onSelectPdf={handleSelectPdf}
          onUploaded={refreshDocs}
          onDeleteChat={clearChat}
        />
      )}

      {pendingPdf && (
        <ChatOptionsModal
          filename={pendingPdf}
          onContinue={handleContinueChat}
          onNew={handleNewChat}
          onCancel={() => setPendingPdf(null)}
        />
      )}
    </>
  )
}
