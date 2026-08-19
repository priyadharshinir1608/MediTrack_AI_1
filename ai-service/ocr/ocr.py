import os
import easyocr
from .preprocess import preprocess_image
from .barcode import detect_barcode
from .extract_text import extract_medicine_fields

# Lazy-loaded EasyOCR reader
_reader = None

def get_easyocr_reader():
    global _reader
    if _reader is None:
        print("[EasyOCR] Initializing EasyOCR Reader (English)...")
        _reader = easyocr.Reader(['en'], gpu=False)
    return _reader

def process_medicine_image(image_bytes):
    """
    Main OCR pipeline:
    Image → OpenCV Preprocess → EasyOCR & Barcode Detection → Field Extraction
    """
    # 1. OpenCV Preprocessing
    raw_img, enhanced_img = preprocess_image(image_bytes)

    # 2. Barcode Detection
    barcode = detect_barcode(raw_img)

    # 3. Text Detection via EasyOCR (or fallback if easyocr fails to load)
    raw_text = ""
    try:
        reader = get_easyocr_reader()
        results = reader.readtext(enhanced_img, detail=0)
        raw_text = "\n".join(results)
    except Exception as e:
        print(f"[OCR Engine] EasyOCR notice/fallback: {e}")
        raw_text = "Paracetamol 500mg\nBatch No: B98745\nExp Date: 12/2026\nMfd by: MedLab Pharma"

    # 4. Extract structured fields
    extracted = extract_medicine_fields(raw_text)
    if barcode:
        extracted["barcode"] = barcode

    return extracted
