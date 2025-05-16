import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { uploadPdfFile } from '../services/api';

interface FileUploadSectionProps {
  onTextExtracted: (text: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  clearPreviousErrorsAndResults: () => void;
}

const FileUploadSection = ({
  onTextExtracted,
  onUploadStart,
  onUploadEnd,
  clearPreviousErrorsAndResults
}: FileUploadSectionProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    clearPreviousErrorsAndResults();
    setError(null);
    setFileName(null);
    onUploadStart();

    const file = event.target.files?.[0];
    if (!file) {
      onUploadEnd();
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Invalid file type. Please select a PDF file.");
      onUploadEnd();
      if (event.target) event.target.value = "";
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      const data = await uploadPdfFile(file);
      onTextExtracted(data.extracted_text);
    } catch (err: unknown | Error) {
      setError(err instanceof Error ? err.message : "Failed to upload and extract text from PDF.");
      if (event.target) event.target.value = "";
      setFileName(null);
    } finally {
      setIsLoading(false);
      onUploadEnd();
    }
  };

  return (
    <section className="mb-10 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        <span className="text-primary font-bold pr-2">Step 1:</span> Select PDF & Extract Text
      </h2>
      <div>
        <input
          type="file"
          id="pdf-upload"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2.5 file:px-6
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-light
            hover:file:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
            disabled:opacity-50 transition-colors cursor-pointer"
        />
        {fileName && !error && !isLoading && (
          <p className="mt-3 text-sm text-green-600">Selected file: {fileName}</p>
        )}
      </div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} />}
    </section>
  );
};

export default FileUploadSection;
