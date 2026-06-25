from chroma_client import get_collection
from ingest import get_model
from cache import query_cache


def retrieve(query: str, top_k: int = 4, source_filter: str | None = None) -> list[dict]:
    cache_key = f"{query.strip().lower()}|{top_k}|{source_filter or ''}"
    cached = query_cache.get(cache_key)
    if cached is not None:
        return cached

    embedding = get_model().encode(query).tolist()
    collection = get_collection()

    count = collection.count()
    if count == 0:
        return []

    query_kwargs: dict = dict(
        query_embeddings=[embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )
    if source_filter:
        query_kwargs["where"] = {"source": source_filter}

    results = collection.query(**query_kwargs)

    MIN_SCORE = 0.55

    chunks = [
        {
            "text": doc,
            "source": meta["source"],
            "chunk_index": meta["chunk_index"],
            "page": meta.get("page", 1),
            "score": round(1 - dist, 4),
        }
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        )
        if round(1 - dist, 4) >= MIN_SCORE
    ]

    query_cache.set(cache_key, chunks)
    return chunks
