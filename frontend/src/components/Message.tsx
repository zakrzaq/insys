import { JSX } from 'react';
import type { OpenAiResponse, UserPrompt } from '../interfaces';

const htmlText = (text: string): JSX.Element[] => {
  return text.split("\n").map((line, index) => (
    <p key={index} className="my-1">
      {line.trim() === "" ? <>&nbsp;</> : line}
    </p>
  ));
};

interface MessageProps {
  message: OpenAiResponse | UserPrompt;
}

const Message = ({ message }: MessageProps) => {
  const isUserPrompt = (msg: OpenAiResponse | UserPrompt): msg is UserPrompt => {
    return (msg as UserPrompt).user_prompt !== undefined;
  };

  if (isUserPrompt(message)) {
    return (
      <li className="mb-3 p-3 text-primary rounded-lg text-right">
        <p className="font-semibold mb-1">You:</p>
        <div className="text-dark text-sm">
          {htmlText(message.user_prompt)}
        </div>
      </li>
    );
  } else {
    return (
      <li className="mb-3 p-3 bg-gray-200 text-gray-800 rounded-lg">
        <p className="font-semibold mb-1">AI Response:</p>
        <div className="text-dark text-sm">
          {htmlText(message.ai_response)}
        </div>
      </li>
    );
  }
};
export default Message;
