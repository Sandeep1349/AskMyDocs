from contextlib import asynccontextmanager
from collections import Counter
import json
import os
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from ingest import ingest_document, get_model
from retriever import retrieve
from llm import generate_answer, stream_answer
from cache import query_cache
from chroma_client import get_collection

load_dotenv(os.path.join(os.path.dirname(__file__), "../private/.env"))

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load embedding model at startup — eliminates cold-start stall
    print("Loading embedding model...")
    get_model()
    print("Model loaded")
    yield


app = FastAPI(title="RAG Q&A API — Fast", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    top_k: int = 6
    filename: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(400, "Only PDF and TXT files supported")
    file_bytes = await file.read()
    try:
        n = ingest_document(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(422, str(e))
    # Save original file so it can be viewed/downloaded later
    dest = os.path.join(UPLOADS_DIR, file.filename)
    with open(dest, "wb") as f:
        f.write(file_bytes)
    return {"filename": file.filename, "chunks_stored": n}


@app.get("/documents/{filename}/file")
async def get_doc_file(filename: str):
    path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(404, f"File '{filename}' not found")
    media = "application/pdf" if filename.lower().endswith(".pdf") else "text/plain"
    return FileResponse(
        path,
        media_type=media,
        headers={"Content-Disposition": f"inline; filename=\"{filename}\""},
    )


@app.post("/query/stream")
async def query_stream(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(400, "Question cannot be empty")

    chunks = retrieve(req.question, top_k=req.top_k, source_filter=req.filename)

    return StreamingResponse(
        stream_answer(req.question, chunks),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/query")
async def query(req: QueryRequest):
    chunks = retrieve(req.question, top_k=req.top_k, source_filter=req.filename)
    if not chunks:
        return {"answer": "No documents ingested yet.", "sources": []}
    return {
        "answer": generate_answer(req.question, chunks),
        "sources": [{"source": c["source"], "score": c["score"]} for c in chunks],
    }


@app.delete("/cache")
async def clear_cache():
    query_cache.clear()
    return {"cleared": True}


@app.get("/documents")
async def list_docs():
    col = get_collection()
    if col.count() == 0:
        return {"documents": []}
    metas = col.get(include=["metadatas"])["metadatas"]
    counts = Counter(m["source"] for m in metas)
    return {"documents": [{"filename": k, "chunks": v} for k, v in counts.items()]}


@app.delete("/documents/{filename}")
async def delete_doc(filename: str):
    col = get_collection()
    results = col.get(where={"source": filename}, include=["metadatas"])
    ids = results.get("ids", [])
    if not ids:
        raise HTTPException(404, f"Document '{filename}' not found")
    col.delete(ids=ids)
    query_cache.clear()
    saved = os.path.join(UPLOADS_DIR, filename)
    if os.path.isfile(saved):
        os.remove(saved)
    return {"deleted": filename, "chunks_removed": len(ids)}
