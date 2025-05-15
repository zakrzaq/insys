from pydantic import BaseModel


class ProcessIn(BaseModel):
    user_prompt: str

class UsageStats(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class OpenAIProcessResponse(BaseModel):
    ai_response: str
    model_used: str
    usage: UsageStats | None = None 
