import Message from './Message';
import type { OpenAiResponse, UserPrompt } from '../interfaces';

interface ResultsSectionProps {
  messageHistory: (OpenAiResponse | UserPrompt)[];
}

const ResultsSection = ({ messageHistory }: ResultsSectionProps) => {
  return (
    <section className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        <span className="text-primary font-bold pr-2">Step 3:</span> Results
      </h2>
      {messageHistory.length === 0 ? (
        <div className="mt-4 p-4 bg-gray-100 text-gray-500 rounded-lg min-w-full min-h-20 flex items-center justify-center">
          <p>Your conversation will appear here.</p>
        </div>
      ) : (
        <ul
          id="result"
          className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg min-w-full min-h-20 max-h-96 overflow-y-auto space-y-4"
        >
          {messageHistory.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ResultsSection;
