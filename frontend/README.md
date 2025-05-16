# PDF Query Application

This is a React-based web application that allows users to upload PDF documents, extract text from them, and then query the extracted content using natural language prompts. The application interacts with a backend service to handle PDF processing and AI-powered querying.

## Features

* **PDF Upload:** Users can select and upload PDF files.
* **Text Extraction:** The application extracts text content from the uploaded PDF (via a backend service).
* **Natural Language Querying:** Users can ask questions or give prompts related to the content of the processed PDF.
* **Responsive Design:** Styled with Tailwind CSS for a modern and responsive user interface.
* **Clear User Workflow:** Guides the user through a simple 3-step process: Upload -> Query -> View Results.
* **Loading & Error States:** Provides feedback to the user during operations and clearly displays any errors.

## Tech Stack

**Frontend:**

* **React:** A JavaScript library for building user interfaces.
* **TypeScript:** Superset of JavaScript that adds static typing.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **Fetch API:** For making requests to the backend.

**Backend (Assumed):**

* A backend server: FastAPI running at `http://localhost:8000`.
* Endpoints for:
    * `/upload`: To handle PDF file uploads and text extraction.
    * `/process`: To process user queries against the extracted text integrating with an AI/LLM service.

## Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (which includes npm, the Node Package Manager). Version 22.x or higher is recommended.
* A running instance of the backend service that this frontend application communicates with. The backend should be accessible at `http://localhost:8000` and expose the `/upload` and `/process` endpoints as expected by the `apiService.ts` file.

## Getting Started

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zakrzaq/insys.git
    cd insys/frontend
    ```

2.  **Install NPM packages:**
    Navigate to the project's root directory (where `package.json` is located) and run:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Currently, the API URL (`http://localhost:8000`) is hardcoded in `src/apiService.ts`. 

4.  **Ensure the Backend Service is Running:**
    Start your backend application that handles PDF processing and querying. It should be listening on `http://localhost:8000`.

5.  **Run the React Application:**
    ```bash
    npm run dev
    ```
    This will run the app in development mode. Open [http://localhost:5173](http://localhost:5173) (or the port specified in your console) to view it in your browser. The page will reload if you make edits.

## Project Structure

* **`src/components/`**: Contains individual React components that make up the UI.
* **`src/App.tsx`**: The main application component that ties everything together.
* **`src/services/api.ts`**: Centralizes all backend API communication logic.
* **`src/interfaces.ts`**: Defines TypeScript types and interfaces used throughout the application.
* **`tailwind.config.js`**: Configuration file for Tailwind CSS, including custom theme settings.

## API Endpoints

The frontend application interacts with the following backend API endpoints (assumed to be running on `http://localhost:8000`):

* **`POST /upload`**:
    * **Purpose:** Uploads a PDF file.
    * **Request Body:** `FormData` with a `file` field containing the PDF.
    * **Response:** JSON object with `extracted_text` (e.g., `{ "extracted_text": "Text from PDF..." }`).
* **`POST /process`**:
    * **Purpose:** Sends a user's query (prompt) to be processed against the previously uploaded document's text.
    * **Request Body:** JSON object with `user_prompt` (e.g., `{ "user_prompt": "What is this document about?" }`).
    * **Response:** JSON object representing the AI's response, conforming to the `OpenAiResponse` interface.

## Available Scripts

In the project directory, you can run:

* **`npm run build`**:
    Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

