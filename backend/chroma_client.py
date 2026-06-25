import chromadb
from dotenv import load_dotenv
import os

load_dotenv()

_client = None
_collection = None


def get_client():
    global _client
    if _client is None:
        path = os.getenv("CHROMA_PERSIST_PATH", "./chroma_store")
        _client = chromadb.PersistentClient(path=path)
    return _client


def get_collection(name: str = "documents"):
    global _collection
    if _collection is None:
        _collection = get_client().get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"}
        )
    return _collection


if __name__ == "__main__":
    get_collection()
    print("Collection ready")
