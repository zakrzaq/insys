import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { processUserPrompt } from '../services/api';
import type { OpenAiResponse, UserPrompt } from '../interfaces';


interface QuerySectionProps {
  onQuerySubmit: (prompt: UserPrompt, response: OpenAiResponse) => void;
  isDocumentReady: boolean;
  onQueryStart: () => void;
  onQueryEnd: () => void;
}

const QuerySection = ({
  onQuerySubmit,
  isDocumentReady,
  onQueryStart,
  onQueryEnd
}: QuerySectionProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || !isDocumentReady) {
      if (!isDocumentReady) setError("Please upload and process a PDF first.");
      else setError("Prompt cannot be empty.");
      return;
    }

    setError(null);
    setIsLoading(true);
    onQueryStart();

    try {
      const aiResponse = await processUserPrompt(prompt);
      const userPromptRecord: UserPrompt = { user_prompt: prompt };
      onQuerySubmit(userPromptRecord, aiResponse);
      setPrompt("");
    } catch (err: unknown | Error) {
      setError(err instanceof Error ? err.message : "Failed to process your query.");
    } finally {
      setIsLoading(false);
      onQueryEnd();
    }
  };

  return (
    <section className="mb-10 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        <span className="text-primary font-bold pr-2">Step 2:</span> Query the Document
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
        <input
          type="text"
          value={prompt}
          onChange={handlePromptChange}
          placeholder={isDocumentReady ? "Ask something about the document..." : "Upload a PDF to enable querying"}
          disabled={isLoading || !isDocumentReady}
          className="flex-grow p-3 pl-4 rounded-lg bg-gray-100 text-dark border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
        />
        <button
          type="submit"
          disabled={isLoading || !isDocumentReady || !prompt.trim()}
          className="py-3 px-6 rounded-lg text-sm font-semibold bg-primary text-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Processing...' : 'Go'}
        </button>
      </form>
      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} />}
    </section>
  );
};

export default QuerySection;
