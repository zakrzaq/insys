interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAiResponse {
  ai_response: string;
  model_used: string;
  usage?: UsageStats
}

export interface UserPrompt {
  user_prompt: string;
}
