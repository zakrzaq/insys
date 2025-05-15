from typing import Dict
from fastapi import FastAPI, File, UploadFile 
from fastapi.middleware.cors import CORSMiddleware

from handlers.upload import handle_upload
from handlers.process import process_with_ai
from schemas import OpenAIProcessResponse, ProcessIn

app_specs = {
        "title": "PDF Text Extraction and OpenAI Processing API",
        "description": "An API to upload a PDF, extract text, and process it with OpenAI.",
        "version": "0.1.0"
        }

app = FastAPI(
    title=app_specs["title"],
    description=app_specs["description"],
    version=app_specs["version"],
        )

origins = [
    "http://localhost",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return app_specs 


@app.post("/upload", response_model=Dict[str, str])
async def upload(file: UploadFile = File(...)) -> Dict[str, str]:
    return await handle_upload(file)


@app.post("/process", response_model=OpenAIProcessResponse)
async def process(req: ProcessIn) -> OpenAIProcessResponse:
    return await process_with_ai(req)
