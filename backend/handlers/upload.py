import io
from fastapi import HTTPException, UploadFile, File
from pdfminer.high_level import extract_text
from uuid import uuid4

from utils.logger import logger
from lib.ai_processor import ai_proc


async def handle_upload(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        logger.error(
            f"{file.filename or 'uploaded_pdf'} Invalid file type. Please upload a PDF file."
        )
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a PDF file.",
        )

    try:
        logger.info(f"{file.filename or 'uploaded_pdf'} Processing PDF text.")
        ai_proc.reset_state()
        ai_proc.session_id = str(uuid4())

        ai_proc.file = file
        pdf_content = await file.read()
        pdf_stream = io.BytesIO(pdf_content)

        extracted_text = extract_text(pdf_stream).strip()
        ai_proc.text = extracted_text
        ai_proc.set_text(extracted_text)
        ai_proc.embed_and_index_chunks()

        if not extracted_text:
            logger.error(
                f"{file.filename or 'uploaded_pdf'} No text could be extracted."
            )
            raise HTTPException(
                status_code=415,
                detail="No text could be extracted. The PDF might be image-based, password-protected, or corrupted.",
            )

        logger.info(f"{file.filename or 'uploaded_pdf'} Text processed.")
        return {
            "filename": file.filename or "uploaded_pdf",
            "extracted_text": extracted_text,
            "status": "success",
        }
    except Exception as e:
        logger.error(f"{file.filename or 'uploaded_pdf'} Error processing PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the PDF: {str(e)}",
        )
