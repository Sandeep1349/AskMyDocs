# AskMyDocs

A RAG (Retrieval-Augmented Generation) document Q&A app. Upload a PDF or TXT file and ask questions about it — answers stream in real time, grounded in your document.

## Features

- Upload PDF or TXT documents
- Ask questions and get AI answers grounded in document content
- Real-time streaming responses (SSE)
- Source citations with page numbers and relevance scores
- Conversational fallback for general questions
- Persistent chat history per document
- Animated UI with Atomic-Motion green theme

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Embeddings | `BAAI/bge-small-en-v1.5` |
| Vector DB | ChromaDB (HNSW, cosine similarity) |
| Backend | FastAPI + Uvicorn (SSE streaming) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Chunking | LangChain RecursiveCharacterTextSplitter |

## Project Structure

```
AskMyDocs/
├── backend/
│   ├── main.py           # FastAPI app and endpoints
│   ├── ingest.py         # PDF parsing, chunking, embedding
│   ├── retriever.py      # Vector similarity search
│   ├── llm.py            # Groq streaming
│   └── chroma_client.py  # ChromaDB connection
├── frontend/
│   └── src/
│       ├── components/   # Dashboard, ChatView, ChatPanel, PDFViewer
│       ├── hooks/        # useChats (localStorage persistence)
│       └── api.js        # Backend API calls
├── private/              # gitignored — your secrets live here
└── .env.example          # Config template
```

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Sandeep1349/AskMyDocs.git
cd AskMyDocs
```

### 2. Create your private config folder

```bash
mkdir private
```

Create `private/.env` (copy from `.env.example` and fill in your key):

```
GROQ_API_KEY=your_groq_api_key_here
CHROMA_PERSIST_PATH=./chroma_store
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
LLM_MODEL=llama-3.3-70b-versatile
CORS_ORIGINS=http://localhost:5174
CACHE_MAX_SIZE=128
```

Create `private/.env.local`:

```
VITE_API_URL=http://localhost:8001
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174)

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload PDF or TXT |
| POST | `/query/stream` | SSE streaming answer |
| GET | `/documents` | List uploaded documents |
| DELETE | `/documents/{filename}` | Remove a document |
| DELETE | `/cache` | Clear query cache |

## How It Works

```
Upload PDF
    │
    ▼
PyMuPDF extract text → chunk (900 chars, 200 overlap)
    │
    ▼
bge-small-en embeddings → ChromaDB vector store
    │
    ▼
User asks question
    │
    ▼
Embed question → cosine similarity search (top 6 chunks, score ≥ 0.55)
    │
    ▼
Groq llama-3.3-70b streams answer → SSE tokens to browser
```

## Author

Sandeep · [github.com/Sandeep1349](https://github.com/Sandeep1349) · MS Data Science, UMass Dartmouth
