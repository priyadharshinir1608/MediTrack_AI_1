import os
import re
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
    Image → OpenCV Preprocess → Spatial Token Grouping → EasyOCR & Barcode Detection → Field Extraction
    """
    # 1. OpenCV Preprocessing
    raw_img, enhanced_img = preprocess_image(image_bytes)

    # 2. Barcode Detection (check raw image, then enhanced image if not detected)
    barcode = detect_barcode(raw_img)
    if not barcode and enhanced_img is not None:
        barcode = detect_barcode(enhanced_img)

    # 3. Text Detection via EasyOCR with 2D spatial line reconstruction
    raw_text = ""
    try:
        reader = get_easyocr_reader()
        # detail=1 gives bounding boxes to reconstruct horizontal lines properly
        results = reader.readtext(enhanced_img, detail=1)

        tokens = []
        for bbox, text, prob in results:
            if prob > 0.15 and len(text.strip()) > 0:
                y_center = (bbox[0][1] + bbox[2][1]) / 2.0
                x_left = bbox[0][0]
                tokens.append({'y': y_center, 'x': x_left, 'text': text.strip(), 'prob': prob})

        tokens.sort(key=lambda t: t['y'])
        lines = []
        curr_line = []
        curr_y = None

        for t in tokens:
            if curr_y is None:
                curr_y = t['y']
                curr_line.append(t)
            elif abs(t['y'] - curr_y) < 18:
                curr_line.append(t)
            else:
                curr_line.sort(key=lambda item: item['x'])
                lines.append(' '.join([item['text'] for item in curr_line]))
                curr_line = [t]
                curr_y = t['y']

        if curr_line:
            curr_line.sort(key=lambda item: item['x'])
            lines.append(' '.join([item['text'] for item in curr_line]))

        raw_text = "\n".join(lines)
    except Exception as e:
        print(f"[OCR Engine] EasyOCR notice/fallback: {e}")
        raw_text = ""

    # 4. Extract structured fields
    extracted = extract_medicine_fields(raw_text)
    if barcode:
        extracted["barcode"] = str(barcode).strip()
    elif not extracted.get("barcode"):
        # Check if EasyOCR read barcode digits directly (common Indian pharma 890... or 8/12/13/14-digit codes)
        cand_bc = re.search(r'\b(890\d{10}|\d{12,14}|\d{8})\b', raw_text)
        if cand_bc:
            extracted["barcode"] = cand_bc.group(1).strip()

    return extracted
