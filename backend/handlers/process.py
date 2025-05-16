import os
from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAIError

from lib.ai_processor import ai_proc
from utils.logger import logger
from schemas import (
    ProcessIn,
    OpenAIProcessResponse,
    UsageStats,
    ChatCompletionMessageParam,
)

load_dotenv()
MODEL = os.getenv("MODEL", "gpt-3.5-turbo")
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", 10))


async def process_with_ai(req: ProcessIn) -> OpenAIProcessResponse:
    client = ai_proc.client

    if not client:
        logger.error(
            "OpenAI client is not configured or API key is missing. Please check server configuration."
        )
        raise HTTPException(
            status_code=503,
            detail="OpenAI client is not configured or API key is missing. Please check server configuration.",
        )

    if not ai_proc.text:
        logger.error("Text content cannot be empty. Please uplaod a PDF file first")
        raise HTTPException(
            status_code=400,
            detail="Text content cannot be empty. Please uplaod a PDF file first",
        )

    if not req.user_prompt.strip():
        logger.error("User prompt cannot be empty.")
        raise HTTPException(status_code=400, detail="User prompt cannot be empty.")

    try:
        relevant_chunks = ai_proc.search_chunks(req.user_prompt)
        context = "\n\n".join(relevant_chunks)

        message_history = ai_proc.messages.get(ai_proc.session_id, [])
        if not message_history:
            message_history: list[ChatCompletionMessageParam] = [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that processes text. Analyze the provided text based on the user's request.",
                },
            ]
        (
            message_history.append(
                {
                    "role": "user",
                    "content": f"{req.user_prompt}\n\nRelevant context:\n\n---\n{context}\n---",
                }
            ),
        )

        logger.info("Sending query to OpenAI.")
        chat_completion = client.chat.completions.create(
            messages=message_history,
            model=MODEL,
        )
        logger.info("Response from OpenAI received.")

        ai_response_content = chat_completion.choices[0].message.content
        usage_data_dict = None
        if chat_completion.usage:
            dumped_usage = chat_completion.usage.model_dump()
            usage_data_dict = UsageStats(
                prompt_tokens=dumped_usage.get("prompt_tokens", 0),
                completion_tokens=dumped_usage.get("completion_tokens", 0),
                total_tokens=dumped_usage.get("total_tokens", 0),
            )
        message_history.append(
            {
                "role": "assistant",
                "content": ai_response_content,
            }
        )
        if len(message_history) > MAX_HISTORY_MESSAGES * 2 + 1:
            message_history = [message_history[0]] + message_history[
                -(MAX_HISTORY_MESSAGES * 2) :
            ]
        ai_proc.messages[ai_proc.session_id] = message_history

        return OpenAIProcessResponse(
            ai_response=ai_response_content or "No content in AI response.",
            model_used=chat_completion.model or "Unknown model",
            usage=usage_data_dict,
        )

    except OpenAIError as e:
        error_detail = f"OpenAI API error: {str(e)}"
        if hasattr(e, "status_code") and e.status_code == 401:
            error_detail = (
                "OpenAI API request failed: Invalid API key or authentication issue."
            )
        elif hasattr(e, "status_code") and e.status_code == 429:
            error_detail = "OpenAI API request failed: Rate limit exceeded. Please try again later."
        elif hasattr(e, "code") and e.code == "context_length_exceeded":
            error_detail = "OpenAI API request failed: The provided text is too long for the model. Please shorten it."

        logger.error(error_detail)
        raise HTTPException(
            status_code=getattr(e, "status_code", 500), detail=error_detail
        )
    except Exception as e:
        logger.error(f"An unexpected error occurred while processing with OpenAI: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}",
        )
