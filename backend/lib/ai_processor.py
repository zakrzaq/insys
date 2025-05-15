import os
from dotenv import load_dotenv
from fastapi import UploadFile
from openai import OpenAI
import faiss
import numpy as np
import tiktoken

from utils.logger import logger

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class AiProcessor():
    def __init__(self) -> None:
        self.client: OpenAI | None = None
        self.file: UploadFile | None = None
        self.text: str | None = None
        self.index: faiss.IndexFlatL2 | None = None
        self.chunk_texts: list[str] = []
        self.embedding_dim: int = 1536 
        self.messages: dict = {}
        self.session_id: str = ""

        if not OPENAI_API_KEY:
            logger.warning("Warning: OPENAI_API_KEY environment variable not set. OpenAI features will not work.")
            self.client = None
        else:
            try:
                self.client = OpenAI(api_key=OPENAI_API_KEY)
                logger.info("OpenAI client initialized.")
            except Exception as e:
                logger.error(f"Error initializing OpenAI client: {e}")
                self.client = None

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

    def reset_state(self):
        self.file = None
        self.text = None
        self.index = None
        self.chunk_texts = []
        self.messages = []


ai_proc = AiProcessor()
