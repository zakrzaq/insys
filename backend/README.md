# PDF Text Extraction and OpenAI Processing API

This project provides a FastAPI-based backend for uploading PDF files, extracting text from them, and processing the extracted text using OpenAI's API. It includes features like text embedding, chunking, and querying relevant text chunks based on user prompts.

## Features

- Upload PDF files and extract text using `pdfminer`.
- Process extracted text with OpenAI's GPT models.
- Chunk and embed text for efficient querying using FAISS.
- Query relevant text chunks based on user prompts.
- Logging for debugging and monitoring.

## Project Structure

```
backend/
├── handlers/
│   ├── upload.py         # Handles PDF upload and text extraction
│   ├── process.py        # Handles OpenAI processing of extracted text
├── lib/
│   ├── ai_processor.py   # Core logic for text embedding, chunking, and querying
├── schemas/
│   ├── __init__.py       # Pydantic models and TypedDicts for API schemas
├── utils/
│   ├── logger.py         # Logging configuration
├── main.py               # FastAPI application entry point
```

## API Endpoints

### `GET /`
Returns the API specifications.

**Response:**
```json
{
  "title": "PDF Text Extraction and OpenAI Processing API",
  "description": "An API to upload a PDF, extract text, and process it with OpenAI.",
  "version": "0.1.0"
}
```

### `POST /upload`
Uploads a PDF file and extracts its text.

**Request:**
- `file` (form-data): The PDF file to upload.

**Response:**
```json
{
  "filename": "example.pdf",
  "extracted_text": "Extracted text from the PDF...",
  "status": "success"
}
```

### `POST /process`
Processes the extracted text with OpenAI based on a user prompt.

**Request:**
```json
{
  "user_prompt": "Summarize the text."
}
```

**Response:**
```json
{
  "ai_response": "The summary of the text is...",
  "model_used": "gpt-3.5-turbo",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 20,
    "total_tokens": 70
  }
}
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- [FAISS](https://github.com/facebookresearch/faiss)
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zakrzaq/insys.git
   cd insys/backend
   ```

    Use [UV](https://docs.astral.sh/uv/) for a more efficient virtual environment management:
    ```bash
    uv sync
    uv run fastapi dev main.py
    ```

    Or, if you prefer to use `pip`:
    > Do not forget to setup the `.env file` like in example below:
    ```

2. Create a virtual environment and activate it:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key
   MODEL=gpt-3.5-turbo
   MAX_HISTORY_MESSAGES=10
   ```

5. Run the application:
   ```bash
   `fastapi dev main.py` 
   ```

6. Access the API at `http://127.0.0.1:8000`.

## Logging

Logs are stored in the `logs/app.log` file. The logger is configured to log:
- Debug-level messages to the file.
- Info-level messages to the console.

## Error Handling

- **400 Bad Request**: Invalid input (e.g., non-PDF file, empty user prompt).
- **415 Unsupported Media Type**: No text could be extracted from the PDF.
- **500 Internal Server Error**: Unexpected errors during processing.

## Dependencies

- [FastAPI](https://fastapi.tiangolo.com/)
- [pdfminer.six](https://github.com/pdfminer/pdfminer.six)
- [FAISS](https://github.com/facebookresearch/faiss)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [tiktoken](https://github.com/openai/tiktoken)
- [Pydantic](https://pydantic-docs.helpmanual.io/)

