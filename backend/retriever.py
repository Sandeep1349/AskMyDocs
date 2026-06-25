from chroma_client import get_collection
from ingest import get_model
from cache import query_cache


def retrieve(query: str, top_k: int = 4) -> list[dict]:
    cache_key = f"{query.strip().lower()}|{top_k}"
    cached = query_cache.get(cache_key)
    if cached is not None:
        return cached

    embedding = get_model().encode(query).tolist()
    collection = get_collection()

    count = collection.count()
    if count == 0:
        return []

    results = collection.query(
        query_embeddings=[embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"]
    )

    chunks = [
        {
            "text": doc,
            "source": meta["source"],
            "chunk_index": meta["chunk_index"],
            "score": round(1 - dist, 4),
        }
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        )
    ]

    query_cache.set(cache_key, chunks)
    return chunks
