import re

def extract_medicine_fields(raw_text):
    """
    Parses OCR text output to extract structured medicine fields.
    """
    extracted = {
        "name": "",
        "batchNumber": "",
        "expiryDate": "",
        "manufactureDate": "",
        "manufacturer": "",
        "category": "Tablet",
        "rawText": raw_text
    }

    if not raw_text:
        return extracted

    # Batch Number Regex (e.g. B.No: B12345, BATCH: AB987, Lot: 4432)
    batch_match = re.search(r'(?:B\.?No|BATCH|LOT|B\.N\.|B/N)[:.\s]*([A-Z0-9\-]+)', raw_text, re.IGNORECASE)
    if batch_match:
        extracted["batchNumber"] = batch_match.group(1).strip()

    # Expiry Date Regex (e.g., EXP: 12/2026, EXP DATE: 05-2027, EXP. 10/25)
    exp_match = re.search(r'(?:EXP|EXPIRY|EXP\.?DATE)[:.\s]*(\d{2}[/.\-]\d{2,4}|\w{3}[/.\-]?\d{4})', raw_text, re.IGNORECASE)
    if exp_match:
        extracted["expiryDate"] = exp_match.group(1).strip()

    # Manufacture Date Regex (e.g., MFG: 01/2024, MFG DATE: 05-2023)
    mfg_match = re.search(r'(?:MFG|MFD|MANUFACTURED)[:.\s]*(\d{2}[/.\-]\d{2,4}|\w{3}[/.\-]?\d{4})', raw_text, re.IGNORECASE)
    if mfg_match:
        extracted["manufactureDate"] = mfg_match.group(1).strip()

    # Manufacturer / Company Name
    mfg_co_match = re.search(r'(?:Mfd by|Manufactured by|Mfg by|Company|Pharm)[:.\s]*([A-Za-z0-9\s.,]+?)(?=\s(?:B\.No|EXP|MFG|Lic|Price|$))', raw_text, re.IGNORECASE)
    if mfg_co_match:
        extracted["manufacturer"] = mfg_co_match.group(1).strip()

    # Category Detection
    if re.search(r'\b(SYRUP|SUSPENSION|SOLUTION|LIQUID)\b', raw_text, re.IGNORECASE):
        extracted["category"] = "Syrup"
    elif re.search(r'\b(CAPSULE|CAPS)\b', raw_text, re.IGNORECASE):
        extracted["category"] = "Capsule"
    elif re.search(r'\b(INJECTION|INJ)\b', raw_text, re.IGNORECASE):
        extracted["category"] = "Injection"
    elif re.search(r'\b(CREAM|OINTMENT|GEL)\b', raw_text, re.IGNORECASE):
        extracted["category"] = "Ointment"
    elif re.search(r'\b(TABLET|TABS)\b', raw_text, re.IGNORECASE):
        extracted["category"] = "Tablet"

    # Extract probable medicine title from top lines
    lines = [l.strip() for l in raw_text.split('\n') if len(l.strip()) > 2]
    keywords_to_skip = ['EXP', 'MFG', 'B.NO', 'BATCH', 'PRICE', 'MRP', 'KEEP OUT', 'STORE IN']
    for line in lines[:5]:
        if not any(k in line.upper() for k in keywords_to_skip):
            # Clean non-alphanumeric noise
            clean_name = re.sub(r'[^a-zA-Z0-9\s\-]', '', line).strip()
            if len(clean_name) >= 3:
                extracted["name"] = clean_name
                break

    return extracted
