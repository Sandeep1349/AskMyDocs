import fitz
import uuid
import torch
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from chroma_client import get_collection
from cache import query_cache
import os

_model = None


def _best_device() -> str:
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def get_model():
    global _model
    if _model is None:
        name = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
        device = _best_device()
        print(f"Loading embedding model on {device}…")
        _model = SentenceTransformer(name, device=device)
        # warm-up: first MPS/CUDA encode is slow due to kernel init
        _model.encode("warm up", show_progress_bar=False)
        print(f"Embedding model ready ({device})")
    return _model


SPLITTER = RecursiveCharacterTextSplitter(
    chunk_size=900,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)


def extract_pages(file_bytes: bytes) -> list[tuple[int, str]]:
    """Returns (1-based page number, text) for each PDF page that has content."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    return [(i + 1, p.get_text()) for i, p in enumerate(doc) if p.get_text().strip()]


def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="replace")


def ingest_document(file_bytes: bytes, filename: str) -> int:
    all_chunks: list[str] = []
    all_pages: list[int] = []

    if filename.lower().endswith(".pdf"):
        for page_num, page_text in extract_pages(file_bytes):
            page_chunks = SPLITTER.split_text(page_text)
            all_chunks.extend(page_chunks)
            all_pages.extend([page_num] * len(page_chunks))
    else:
        raw = extract_text_from_txt(file_bytes)
        all_chunks = SPLITTER.split_text(raw)
        all_pages = [1] * len(all_chunks)

    if not all_chunks:
        raise ValueError(f"No text extracted from {filename}")

    model = get_model()
    embeddings = model.encode(
        all_chunks, batch_size=32, show_progress_bar=False
    ).tolist()

    get_collection().add(
        ids=[str(uuid.uuid4()) for _ in all_chunks],
        documents=all_chunks,
        embeddings=embeddings,
        metadatas=[
            {"source": filename, "chunk_index": i, "page": all_pages[i]}
            for i in range(len(all_chunks))
        ],
    )

    query_cache.clear()
    return len(all_chunks)
