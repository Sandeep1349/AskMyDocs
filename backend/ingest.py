import fitz
import uuid
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from chroma_client import get_collection
from cache import query_cache
import os

_model = None


def get_model():
    global _model
    if _model is None:
        name = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
        _model = SentenceTransformer(name)
    return _model


SPLITTER = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)


def extract_text(file_bytes: bytes, filename: str) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    return "\n\n".join(p.get_text() for p in doc if p.get_text().strip())


def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="replace")


def ingest_document(file_bytes: bytes, filename: str) -> int:
    if filename.lower().endswith(".pdf"):
        raw = extract_text(file_bytes, filename)
    else:
        raw = extract_text_from_txt(file_bytes)

    chunks = SPLITTER.split_text(raw)
    if not chunks:
        raise ValueError(f"No text extracted from {filename}")

    model = get_model()
    embeddings = model.encode(
        chunks, batch_size=32, show_progress_bar=False
    ).tolist()

    get_collection().add(
        ids=[str(uuid.uuid4()) for _ in chunks],
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"source": filename, "chunk_index": i} for i in range(len(chunks))]
    )

    query_cache.clear()
    return len(chunks)
