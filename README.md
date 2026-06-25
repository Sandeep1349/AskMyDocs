# AskMyDocs — RAG Document Q&A

A speed-optimised Retrieval-Augmented Generation (RAG) app that lets you upload PDFs and ask questions about them. Answers stream in real-time via SSE.

## Performance targets

| Metric | Target |
|--------|--------|
| First token time (TTFT) | < 1 second |
| Cache hit (repeat query) | < 100 ms |
| Server cold-start | < 5 seconds |

## Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Embedding | `BAAI/bge-small-en-v1.5` | ~20% faster than MiniLM, same 384-dim |
| LLM | `claude-haiku-4-5-20251001` | 5–10× faster TTFT vs Sonnet |
| Response | SSE streaming | First token in <1s vs 3–5s wait |
| Cache | In-process LRU (128 slots) | Repeat queries instant |
| Vector DB | ChromaDB (HNSW, cosine) | Embedded, no extra service |
| Backend | FastAPI + Uvicorn | Async, SSE-native |
| Frontend | React 18 + Vite + Tailwind | Streaming token render |

## Quick start (local dev)

### 1. Clone and set up environment

```bash
git clone <repo-url>
cd AskMyDocs
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --reload
```

Server boots in ~3s and logs `Model loaded` before accepting requests.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

### 4. Use it

1. Drop a PDF or TXT file in the left panel
2. Ask any question in the chat box
3. Watch the answer stream in character-by-character

## Docker (full stack)

```bash
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload PDF or TXT |
| POST | `/query/stream` | SSE streaming answer (primary) |
| POST | `/query` | Full JSON answer (fallback) |
| GET | `/documents` | List ingested documents |
| DELETE | `/documents/{filename}` | Remove a document |
| DELETE | `/cache` | Clear LRU query cache |

## Architecture

```
User
 │
 ▼
React UI (Vite + Tailwind)
 │  ReadableStream SSE consumer
 │
 ▼
FastAPI (single uvicorn worker)
 │
 ├─ POST /upload ──► ingest.py ──► PyMuPDF extract ──► bge-small encode (batch=32)
 │                                                    ──► ChromaDB upsert
 │                                                    ──► LRU cache.clear()
 │
 └─ POST /query/stream ──► retriever.py ──► LRU cache hit? ──► return instantly
                                        └─► bge-small encode ──► ChromaDB cosine query
                                            ──► llm.py ──► Anthropic Haiku stream
                                                         ──► SSE token yield
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | required | Your Anthropic API key |
| `CHROMA_PERSIST_PATH` | `./chroma_store` | ChromaDB storage path |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` | Sentence-transformer model |
| `LLM_MODEL` | `claude-haiku-4-5-20251001` | Anthropic model ID |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `CACHE_MAX_SIZE` | `128` | LRU cache capacity (slots) |

## Design decisions

- **Single uvicorn worker**: shares the in-memory embedding model and LRU cache across all requests. Add Redis if you need horizontal scale.
- **bge-small over MiniLM**: same 384-dim space, ~20% faster encode, marginally better MTEB retrieval score.
- **Haiku for RAG**: the LLM only synthesises retrieved context — quality ceiling is set by retrieval, not model reasoning. Haiku is 5–10× faster than Sonnet for this task.
- **SSE over WebSocket**: unidirectional, HTTP/1.1 compatible, no upgrade handshake — simpler and lower-latency.
- **LRU invalidation on upload**: cache clears on every new document upload to prevent stale answers.
- **FastAPI lifespan hook**: pre-loads the embedding model at startup, eliminating the cold-start spike on the first query.

## Prepared by

Sandeep · [github.com/Sandeep1349](https://github.com/Sandeep1349) · UMass Dartmouth MS Data Science
