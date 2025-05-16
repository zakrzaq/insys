import type { OpenAiResponse } from '../interfaces';

const API_URL = "http://localhost:8000";

/**
 * Uploads a PDF file to the server.
 * @param file - The PDF file to upload.
 * @returns A promise that resolves with the extracted text from the PDF.
 * @throws Will throw an error if the upload fails or the server response is not ok.
 */
export const uploadPdfFile = async (file: File): Promise<{ extracted_text: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status} ${response.statusText}` }));
    throw new Error(errorData.message || `Failed to upload file. Status: ${response.status}`);
  }

  return response.json();
};

/**
 * Sends a user prompt to the server for processing.
 * @param userPrompt - The text of the user's prompt.
 * @returns A promise that resolves with the AI's response.
 * @throws Will throw an error if the request fails or the server response is not ok.
 */
export const processUserPrompt = async (userPrompt: string): Promise<OpenAiResponse> => {
  const response = await fetch(`${API_URL}/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_prompt: userPrompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status} ${response.statusText}` }));
    throw new Error(errorData.message || `Failed to process prompt. Status: ${response.status}`);
  }
  return response.json();
};
