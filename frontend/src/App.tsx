import React, { useState, useCallback } from "react";
import type { OpenAiResponse, UserPrompt } from "./interfaces";
import Header from "./components/Header";
import FileUploadSection from "./components/FileUploadSection";
import QuerySection from "./components/QuerySection";
import ResultsSection from "./components/ResultsSection";

function App() {
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const [messageHistory, setMessageHistory] = useState<(OpenAiResponse | UserPrompt)[]>([]);

  const [isDocumentReadyForQuery, setIsDocumentReadyForQuery] = useState<boolean>(false);

  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [isQueryProcessing, setIsQueryProcessing] = useState<boolean>(false);

  const handleTextExtracted = useCallback((text: string) => {
    setExtractedText(text);
    setIsDocumentReadyForQuery(true);
    setMessageHistory([]);
  }, []);

  const handleQuerySubmit = useCallback((prompt: UserPrompt, response: OpenAiResponse) => {
    setMessageHistory((prevHistory) => [...prevHistory, prompt, response]);
  }, []);

  const handleClearPreviousState = useCallback(() => {
    setExtractedText(null);
    setMessageHistory([]);
    setIsDocumentReadyForQuery(false);
  }, []);

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <FileUploadSection
          onTextExtracted={handleTextExtracted}
          onUploadStart={() => setIsFileUploading(true)}
          onUploadEnd={() => setIsFileUploading(false)}
          clearPreviousErrorsAndResults={handleClearPreviousState}
        />

        <QuerySection
          onQuerySubmit={handleQuerySubmit}
          isDocumentReady={isDocumentReadyForQuery}
          onQueryStart={() => setIsQueryProcessing(true)}
          onQueryEnd={() => setIsQueryProcessing(false)}
        />

        <ResultsSection messageHistory={messageHistory} />
      </main>
      <footer className="text-center py-6 mt-10 border-t border-gray-300">
        <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} PDF Insights Engine 🚀. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
