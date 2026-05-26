import fitz  # PyMuPDF
from docx import Document


def extract_text_from_pdf(file_path):
    text = ""
    pdf_document = fitz.open(file_path)
    for page in pdf_document:
        text += page.get_text()
    pdf_document.close()
    return text


def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text


def extract_text_by_type(file_path, file_type):
    if file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        return extract_text_from_docx(file_path)
    elif file_type == 'text':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    return ""