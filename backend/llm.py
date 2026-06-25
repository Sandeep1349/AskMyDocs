import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def build_prompt(question: str, chunks: list[dict]) -> str:
    context = "\n\n---\n\n".join(
        f"[Source: {c['source']}]\n{c['text']}" for c in chunks
    )
    return (
        "Answer using ONLY the context below. If the answer is not "
        "in the context, say: 'I don't have enough information.'\n\n"
        f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    )


def stream_answer(question: str, chunks: list[dict]):
    """Generator — yields SSE-formatted data strings."""
    prompt = build_prompt(question, chunks)
    model = os.getenv("LLM_MODEL", "claude-haiku-4-5-20251001")

    with get_client().messages.stream(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {json.dumps({'token': text})}\n\n"

    sources = list(dict.fromkeys(c["source"] for c in chunks))
    yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"


def generate_answer(question: str, chunks: list[dict]) -> str:
    """Non-streaming fallback for /query endpoint."""
    prompt = build_prompt(question, chunks)
    model = os.getenv("LLM_MODEL", "claude-haiku-4-5-20251001")
    msg = get_client().messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text
