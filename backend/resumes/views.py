import io
import os
import fitz
import pdfplumber
import pytesseract
from pdf2image import convert_from_bytes
from docx import Document
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Resume
from .serializers import ResumeSerializer
from matching.utils import extract_skills

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\Users\ABAKUS\Desktop\poppler\poppler\Library\bin"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def extract_text_from_file(uploaded_file):
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    print("EXT:", ext)

    try:
        if ext == ".pdf":
            data = uploaded_file.read()
            text = ""

            # 1) PyMuPDF
            try:
                print("PyMuPDF deneniyor...")
                pdf = fitz.open(stream=data, filetype="pdf")
                for page in pdf:
                    page_text = page.get_text("text")
                    if page_text:
                        text += page_text + "\n"
                print("PyMuPDF sonucu uzunluk:", len(text))
            except Exception as e:
                print("PyMuPDF error:", e)

            # 2) pdfplumber
            if not text.strip():
                try:
                    print("pdfplumber deneniyor...")
                    uploaded_file.seek(0)
                    with pdfplumber.open(uploaded_file) as pdf:
                        plumber_text = []
                        for page in pdf.pages:
                            t = page.extract_text()
                            if t:
                                plumber_text.append(t)
                        text = "\n".join(plumber_text)
                    print("pdfplumber sonucu uzunluk:", len(text))
                except Exception as e:
                    print("pdfplumber error:", e)

            # 3) OCR
            if not text.strip():
                try:
                    print("OCR deneniyor...")
                    images = convert_from_bytes(data, poppler_path=POPPLER_PATH)
                    print("OCR image sayısı:", len(images))

                    ocr_text = []
                    for i, img in enumerate(images):
                        print(f"OCR page {i+1} okunuyor...")
                        t = pytesseract.image_to_string(img, lang="tur+eng")
                        if t:
                            ocr_text.append(t)

                    text = "\n".join(ocr_text)
                    print("OCR sonucu uzunluk:", len(text))
                except Exception as e:
                    print("OCR error:", e)

            uploaded_file.seek(0)
            return text.strip()

        elif ext == ".docx":
            print("DOCX okunuyor...")
            data = uploaded_file.read()
            doc = Document(io.BytesIO(data))
            text = "\n".join([p.text for p in doc.paragraphs if p.text])
            uploaded_file.seek(0)
            return text.strip()

        elif ext == ".txt":
            print("TXT okunuyor...")
            data = uploaded_file.read().decode("utf-8", errors="ignore")
            uploaded_file.seek(0)
            return data.strip()

    except Exception as e:
        print("TEXT EXTRACTION ERROR:", e)
        uploaded_file.seek(0)
        return ""

    return ""


class ResumeUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        title = request.data.get("title")
        file = request.FILES.get("file")
        raw_text = request.data.get("raw_text", "").strip()

        if not title:
            return Response({"error": "Başlık zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        if not file and not raw_text:
            return Response({"error": "Dosya veya CV metni zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        extracted_text = ""
        ext = "txt"

        if file:
            ext = os.path.splitext(file.name)[1].lower().replace(".", "")
            extracted_text = extract_text_from_file(file)

        final_text = extracted_text if extracted_text.strip() else raw_text
        

        if not final_text.strip():
            return Response(
                {
                    "error": "CV metni çıkarılamadı. PDF görsel olabilir. DOCX/TXT yükleyin veya CV metnini elle girin."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        skills = extract_skills(final_text)

        resume = Resume.objects.create(
            user=request.user,
            title=title,
            file=file if file else None,
            file_type=ext if file else "txt",
            raw_text=raw_text if raw_text else final_text,
            extracted_text=final_text,
            skills=skills,
        )

        return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
class ResumeDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
            resume.delete()
            return Response({"detail": "CV silindi."}, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"error": "CV bulunamadı."}, status=status.HTTP_404_NOT_FOUND)


class ResumeDeleteView(generics.DestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)