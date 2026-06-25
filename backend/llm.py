import groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

_client = None

SYSTEM = (
    "You are a helpful document assistant. "
    "When document context is provided, answer accurately using only that context. "
    "For greetings or general questions not related to the documents, respond naturally and helpfully."
)


def get_client():
    global _client
    if _client is None:
        _client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _client


def build_messages(question: str, chunks: list[dict]) -> list[dict]:
    if chunks:
        context = "\n---\n".join(
            f"[p.{c.get('page', '?')}] {c['text']}" for c in chunks
        )
        user_content = (
            f"Answer using the document context below. "
            f"If the specific answer isn't in the context, say so.\n\n"
            f"Context:\n{context}\n\nQuestion: {question}"
        )
    else:
        user_content = question

    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_content},
    ]


def stream_answer(question: str, chunks: list[dict]):
    """Generator — yields SSE-formatted data strings."""
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    messages = build_messages(question, chunks)

    stream = get_client().chat.completions.create(
        model=model,
        max_tokens=1024,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            yield f"data: {json.dumps({'token': text})}\n\n"

    seen: set[tuple] = set()
    sources = []
    for c in chunks:
        key = (c["source"], c.get("page", 1))
        if key not in seen:
            seen.add(key)
            sources.append({"source": c["source"], "page": c.get("page", 1), "score": c["score"]})
    yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"


def generate_answer(question: str, chunks: list[dict]) -> str:
    """Non-streaming fallback for /query endpoint."""
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    messages = build_messages(question, chunks)
    msg = get_client().chat.completions.create(
        model=model,
        max_tokens=1024,
        messages=messages,
    )
    return msg.choices[0].message.content
