```python
# lib/ai_processor.py

from openai import OpenAI
import faiss
import numpy as np
import tiktoken

class AIProcessor:
    def __init__(self):
        self.client: OpenAI | None = None
        self.text: str | None = None
        self.index: faiss.IndexFlatL2 | None = None
        self.chunk_texts: list[str] = []
        self.embedding_dim: int = 1536  # for text-embedding-3-small

    def set_client(self, client: OpenAI):
        self.client = client

    def set_text(self, text: str):
        self.text = text

    def chunk_text(self, max_tokens: int = 300) -> list[str]:
        encoding = tiktoken.encoding_for_model("text-embedding-3-small")
        tokens = encoding.encode(self.text or "")
        chunks = []

        for i in range(0, len(tokens), max_tokens):
            chunk = encoding.decode(tokens[i:i + max_tokens])
            chunks.append(chunk)

        return chunks

    def embed_and_index_chunks(self):
        if not self.client or not self.text:
            raise ValueError("Client or text not set.")

        chunks = self.chunk_text()
        embeddings = []

        for chunk in chunks:
            response = self.client.embeddings.create(
                input=chunk,
                model="text-embedding-3-small"
            )
            embeddings.append(response.data[0].embedding)

        self.chunk_texts = chunks
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.index.add(np.array(embeddings).astype("float32"))

    def search_chunks(self, prompt: str, top_k: int = 3) -> list[str]:
        if not self.index or not self.client:
            raise ValueError("FAISS index or client not set.")

        prompt_embedding = self.client.embeddings.create(
            input=prompt,
            model="text-embedding-3-small"
        ).data[0].embedding

        D, I = self.index.search(np.array([prompt_embedding]).astype("float32"), top_k)
        return [self.chunk_texts[i] for i in I[0]]

# Initialize a shared instance
ai_proc = AIProcessor()
```



```python
from fastapi import HTTPException
from openai import OpenAIError
from lib.ai_processor import ai_proc
from utils.logger import logger
from schemas import ProcessIn, OpenAIProcessResponse, UsageStats


async def process_with_ai(req: ProcessIn) -> OpenAIProcessResponse:
    client = ai_proc.client

    if not client:
        logger.error("OpenAI client not configured.")
        raise HTTPException(status_code=503, detail="OpenAI client not configured.")

    if not ai_proc.text:
        logger.error("No text uploaded.")
        raise HTTPException(status_code=400, detail="No text uploaded.")

    if not req.user_prompt.strip():
        logger.error("Prompt is empty.")
        raise HTTPException(status_code=400, detail="Prompt is empty.")

    try:
        # Fetch relevant chunks from FAISS
        relevant_chunks = ai_proc.search_chunks(req.user_prompt)
        context = "\n\n".join(relevant_chunks)

        messages = [
            {"role": "system", "content": "You are a helpful assistant for document analysis."},
            {"role": "user", "content": f"{req.user_prompt}\n\nRelevant context:\n{context}"}
        ]

        logger.info("Sending to OpenAI.")
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="gpt-3.5-turbo"
        )

        response = chat_completion.choices[0].message.content
        usage_data = chat_completion.usage.model_dump() if chat_completion.usage else {}

        return OpenAIProcessResponse(
            ai_response=response or "No response.",
            model_used=chat_completion.model,
            usage=UsageStats(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0)
            )
        )

    except OpenAIError as e:
        logger.error(f"OpenAI error: {e}")
        raise HTTPException(status_code=getattr(e, 'status_code', 500), detail=str(e))

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

```
