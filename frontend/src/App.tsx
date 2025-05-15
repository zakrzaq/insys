import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { OpenAiResponse, UserPrompt } from './interfaces';
import Header from "./componets/Header"
import Spinner from './componets/Spinner';
import ErrorMessage from './componets/ErrorMessage';
import Message from './componets/Message';

const API_URL = 'http://localhost:8000'

function App() {
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [userPrompt, setUserPrompt] = useState<string | null>(null)
  const [messageHistory, setMessageHistory] = useState<[] | (OpenAiResponse | UserPrompt)[]>([])

  const [isFileLoading, setIsFileLoading] = useState<boolean>(false)
  const [isFileError, setIsFileError] = useState<string | null>(null)
  const [isProcessLoading, setIsProcessLoading] = useState<boolean>(false)
  const [isProcessError, setIsProcessError] = useState<string | null>(null)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData })
    if (res.ok) {
      const data = await res.json()
      setExtractedText(data.extracted_text)
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsFileError(null)
    setUserPrompt(null)
    setIsProcessError(null)
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    try {
      setIsFileLoading(true)
      await uploadFile(file)
      setFileSelected(file)
    } catch (error: unknown | Error) {
      setIsFileError(error instanceof Error ? error.message : "Failed to process request.")
    } finally {
      setIsFileLoading(false)
    }
  }

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => setUserPrompt(e.target.value)

  const processRequest = async () => {
    if (!userPrompt) return
    setIsProcessError(null)
    try {
      setIsProcessLoading(true)
      const res = await fetch(`${API_URL}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_prompt: userPrompt }),
      });

      if (!res.ok) {
        setIsProcessError(res.statusText)
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      const userPromptRecord: UserPrompt = { user_prompt: userPrompt }
      setMessageHistory((prev) => [...prev, userPromptRecord]);
      setUserPrompt(null)
      setMessageHistory((prev) => [...prev, data]);
    } catch (error: unknown | Error) {
      setIsProcessError(error instanceof Error ? error.message : "Failed to process request.")
      console.error("Failed to process request:", error);
    } finally {
      setIsProcessLoading(false)
    }

  };


  return (
    <>
      <Header />

      <section>
        <h2><span className="text-primary pr-2">Step 1:</span> PDF & Extract Text</h2>
        <div>
          <input
            type="file" id="pdf-upload" accept="application/pdf" onChange={handleFileChange}
            className="block w-auto text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-light hover:file:bg-light hover:file:text-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          />
          {isFileLoading && (
            <Spinner />
          )}
          {isFileError && <ErrorMessage message={isFileError} />}
        </div>
      </section>

      <section className='mt-20'>
        <h2><span className="text-primary pr-2">Step 2:</span>Query the document</h2>
        <div className='flex gap-2'>
          <input type='text' className='p-2 rounded-lg bg-light text-dark w-full' placeholder='Prompt...' onChange={handlePromptChange} />
          <button className='py-2.5 px-4 rounded-lg text-sm bg-primary text-light hover:bg-light hover:text-dark' onClick={processRequest}>
            Go
          </button>
        </div>
        {isProcessLoading && (
          <Spinner />
        )}
        {isProcessError && <ErrorMessage message={isProcessError} />}
      </section>

      <section className='mt-20'>
        <h2><span className="text-primary pr-2">Step 3:</span>Result</h2>
        <ul id='result' className='p-4 bg-light text-dark rounded-lg min-w-full min-h-20'>
          {messageHistory.length > 0 && messageHistory.map((mes, index) => (
            <Message key={index} message={mes} />
          ))}
        </ul>
      </section>
    </>
  )
}

export default App
