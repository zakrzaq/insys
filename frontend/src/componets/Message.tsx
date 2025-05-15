import type { OpenAiResponse, UserPrompt } from "../interfaces";

interface Props {
  message: OpenAiResponse | UserPrompt;
}

export function Message(props: Props) {
  const isAi = 'ai_response' in props.message;

  return (
    <li className="block w-full mt-1">
      <p className="text-dark">
        {isAi
          ? <span className="py-1 px-2 mr-1 rounded bg-primary text-light text-xs">AI</span>
          : <span className="py-1 px-2 mr-1 rounded bg-dark text-light text-xs">Me</span>
        }
        {isAi ? props.message.ai_response : props.message.user_prompt}
      </p>
    </li>
  )
}

export default Message;
