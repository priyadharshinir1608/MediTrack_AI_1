import re
from datetime import datetime

MONTH_MAP = {
    'JAN': '01', 'JANUARY': '01',
    'FEB': '02', 'FEBRUARY': '02',
    'MAR': '03', 'MARCH': '03',
    'APR': '04', 'APRIL': '04',
    'MAY': '05',
    'JUN': '06', 'JUNE': '06',
    'JUL': '07', 'JULY': '07',
    'AUG': '08', 'AUGUST': '08',
    'SEP': '09', 'SEPT': '09', 'SEPTEMBER': '09',
    'OCT': '10', 'OCTOBER': '10',
    'NOV': '11', 'NOVEMBER': '11',
    'DEC': '12', 'DECEMBER': '12'
}

def normalize_batch(cand):
    """
    Cleans OCR character confusions in pharmaceutical batch codes.
    e.g. 'TancP260i' -> 'TANCP2601', 'TBIUA2O2O' -> 'TBIUA2020'
    """
    if not cand:
        return ""
    c = cand.strip().upper()
    # Normalize common OCR letter O to digit 0 when surrounded by numbers or at the end of numbers
    c = re.sub(r'(?<=\d)[O](?=\d)', '0', c)
    c = re.sub(r'(?<=\d)[O]$', '0', c)
    # If ends with 'I' or 'L' after numbers, it's digit 1 (e.g. 260I -> 2601)
    if re.search(r'\d+[IL]$', c):
        c = c[:-1] + '1'
    # Clean non-alphanumeric noise
    c = re.sub(r'[^A-Z0-9\-]', '', c)
    return c

def parse_date_to_iso(raw_date_str):
    """
    Converts pharmaceutical date formats to standard ISO format (YYYY-MM-DD)
    suitable for HTML5 <input type="date">.
    Examples:
      - 'JAN.2028' / 'Jan 2028' -> '2028-01-31'
      - 'FEB 2026' -> '2026-02-28'
      - '05/2027' -> '2027-05-31'
    """
    if not raw_date_str:
        return ""
    
    clean_str = raw_date_str.strip().upper()
    clean_str = re.sub(r'^[^\w]+|[^\w]+$', '', clean_str)

    # 1. Full date DD/MM/YYYY or YYYY-MM-DD
    full_date_match = re.search(r'(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})', clean_str)
    if full_date_match:
        d, m, y = full_date_match.groups()
        if len(y) == 2:
            y = f"20{y}"
        if int(d) > 12 and int(m) <= 12:
            return f"{y}-{int(m):02d}-{int(d):02d}"
        elif int(m) <= 12 and int(d) <= 31:
            return f"{y}-{int(m):02d}-{int(d):02d}"

    # 2. Month Name + Year (e.g. JAN.2028, FEB 2026, MARCH/2027)
    month_year_match = re.search(r'([A-Z]{3,9})[.\s/\-_]*(\d{2,4})', clean_str)
    if month_year_match:
        month_name, year = month_year_match.groups()
        if len(year) == 2:
            year = f"20{year}"
        month_num = MONTH_MAP.get(month_name[:3], '01')
        days_in_month = '28' if month_num == '02' else ('30' if month_num in ['04', '06', '09', '11'] else '31')
        return f"{year}-{month_num}-{days_in_month}"

    # 3. Numeric Month + Year (e.g. 05/2027, 12-2026, 10/26)
    num_month_year = re.search(r'(\d{1,2})[.\s/\-_]+(\d{2,4})', clean_str)
    if num_month_year:
        m, year = num_month_year.groups()
        if len(year) == 2:
            year = f"20{year}"
        month_num = f"{int(m):02d}" if 1 <= int(m) <= 12 else '01'
        days_in_month = '28' if month_num == '02' else ('30' if month_num in ['04', '06', '09', '11'] else '31')
        return f"{year}-{month_num}-{days_in_month}"

    return ""


def extract_medicine_fields(raw_text):
    """
    Parses OCR text output to extract structured medicine fields using multi-pass scanning.
    """
    extracted = {
        "name": "",
        "batchNumber": "",
        "expiryDate": "",
        "manufactureDate": "",
        "manufacturer": "",
        "price": 0,
        "costPrice": 0,
        "category": "Tablet",
        "rawText": raw_text
    }

    if not raw_text:
        return extracted

    lines = [l.strip() for l in raw_text.split('\n') if len(l.strip()) > 0]

    # Line-by-line scanning for key-value extraction
    for line in lines:
        upper_line = line.upper()

        # 1. Batch Number
        if not extracted["batchNumber"]:
            batch_match = re.search(
                r'(?:BATCH\s*(?:NO|NUMBER|_)?|B\.?\s*NO\.?|B\.N\.|B/N|LOT\s*(?:NO|NUMBER|_)?|LOT)[:;._\s\-]*([A-Za-z0-9\-]{4,15})',
                line,
                re.IGNORECASE
            )
            if batch_match:
                cand = batch_match.group(1).strip()
                if cand.upper() not in ['NUMBER', 'SPECIFICATIONS', 'IMAGE', 'SCANNER', 'CATEGORY', 'KLIG', 'KILIG', 'DATE', 'NO', 'EXP', 'MFG', 'MG', 'LIC']:
                    extracted["batchNumber"] = normalize_batch(cand)

        # 2. Expiry Date
        if not extracted["expiryDate"]:
            exp_match = re.search(
                r'(?:EXP\s*(?:DATE|DT|_)?|EXPIRY\s*(?:DATE)?|EXP\.?\s*DATE|USE\s*BEFORE|BEST\s*BEFORE)[:;._\s\-]*([A-Za-z]{3,9}[._\s/\-]*\d{2,4}|\d{1,2}[/._\-\s]+\d{2,4}|\d{1,2}[/._\-]\d{1,2}[/._\-]\d{2,4})',
                line,
                re.IGNORECASE
            )
            if exp_match:
                extracted["expiryDate"] = parse_date_to_iso(exp_match.group(1).strip())

        # 3. Manufacture Date
        if not extracted["manufactureDate"]:
            mfg_match = re.search(
                r'(?:MFG\.?\s*(?:DATE|DT|_)?|MFD\.?\s*(?:DATE|DT)?|MANUFACTURED|KILIG:?\s*DATE)[:;._\s\-]*([A-Za-z]{3,9}[._\s/\-]*\d{2,4}|\d{1,2}[/._\-\s]+\d{2,4}|\d{1,2}[/._\-]\d{1,2}[/._\-]\d{2,4})',
                line,
                re.IGNORECASE
            )
            if mfg_match:
                extracted["manufactureDate"] = parse_date_to_iso(mfg_match.group(1).strip())

        # 4. M.R.P. & Price
        if extracted["price"] == 0:
            mrp_match = re.search(
                r'(?:M\.?R\.?P\.?|MAX\.?\s*RETAIL\s*PRICE|PRICE|RS\.?|₹)[:;._\s\-₹Rs]*([0-9]+(?:[.,\s][0-9]{2})?)',
                line,
                re.IGNORECASE
            )
            if mrp_match:
                raw_price = mrp_match.group(1).strip().replace(' ', '.')
                try:
                    val = float(raw_price)
                    if 1.0 <= val <= 50000.0:
                        extracted["price"] = round(val, 2)
                        extracted["costPrice"] = round(val * 0.70, 2)
                except ValueError:
                    pass

        # 5. Manufacturer
        if not extracted["manufacturer"]:
            mfg_co = re.search(
                r'(?:Mfd\s*by|Manufactured\s*by|Mfg\s*by|Marketed\s*by|Pharma|Healthcare)[:;._\s\-]*([A-Za-z0-9\s.,&\-]+?)(?=\s*(?:B\.No|EXP|MFG|Lic|Price|MRP|\n|$))',
                line,
                re.IGNORECASE
            )
            if mfg_co:
                co = mfg_co.group(1).strip()
                if len(co) >= 3 and not re.match(r'^(No|Lic|Date|Mg|Category|Batch)', co, re.IGNORECASE):
                    extracted["manufacturer"] = co

        # 6. Category
        if re.search(r'\b(SYRUP|SUSPENSION|SOLUTION|LIQUID|DROPS)\b', upper_line):
            extracted["category"] = "Syrup" if not re.search(r'\bDROPS\b', upper_line) else "Drops"
        elif re.search(r'\b(CAPSULE|CAPS)\b', upper_line):
            extracted["category"] = "Capsule"
        elif re.search(r'\b(INJECTION|INJ|INFUSION)\b', upper_line):
            extracted["category"] = "Injection"
        elif re.search(r'\b(CREAM|OINTMENT|GEL|EMULGEL)\b', upper_line):
            extracted["category"] = "Ointment"
        elif re.search(r'\b(INHALER|RESPULES|ROTACAPS)\b', upper_line):
            extracted["category"] = "Inhaler"
        elif re.search(r'\b(TABLET|TABS|CAPLET)\b', upper_line):
            extracted["category"] = "Tablet"

    # Multi-pass standalone batch fallback if not found in same line
    if not extracted["batchNumber"]:
        tokens = re.findall(r'\b([A-Za-z0-9\-]{5,15})\b', raw_text)
        for t in tokens:
            tu = t.upper()
            if re.search(r'[A-Z]', tu) and re.search(r'\d', tu):
                if not any(skip in tu for skip in ['TABLET', 'CAPSULE', 'JAN2028', 'FEB2026', '181UA', '161UA', '16UA', 'UA2020', 'MEDICINE', 'PHARMA']):
                    extracted["batchNumber"] = normalize_batch(tu)
                    break

    # 7. Extract medicine brand name from packaging
    skip_keywords = [
        'MFG', 'EXP', 'B.NO', 'BATCH', 'PRICE', 'MRP', 'KEEP OUT', 'STORE IN',
        'FOR EXTERNAL', 'SCHEDULE', 'LIC', 'TAXES', 'INCL', 'ADDNEW', 'MEDICINE SPECIFICATIONS',
        'AI IMAGE SCANNER', 'UPLOAD', 'SCANNER', 'QUANTITY', 'SELLING PRICE', 'COST PRICE',
        'MG LIC', 'MIG: LIC', 'NO:', 'ADD NEW', 'MEDICINE BRAND NAME', 'BRAND NAME', 'FIELDS AUTO',
        'DD-MM-YYYY', 'DD-MM-YY', 'E.G.', 'MEDLAB PHARMA', '8901234567890'
    ]
    for line in lines:
        upper_l = line.upper()
        # Skip if line contains numbers only or UI keywords or prices
        if not any(k in upper_l for k in skip_keywords) and not re.search(r'(?:MRP|PRICE|M\.R\.P|RS|\d+\.\d{2}|^\d+\s+\d+\s+\d+$)', upper_l):
            clean_name = re.sub(r'[^a-zA-Z0-9\s\-+/%().]', '', line).strip()
            # Ensure not a pure numeric string (like '50 150 100')
            if len(clean_name) >= 3 and not re.match(r'^[\d\s]+$', clean_name) and not re.match(r'^\d+[/.\-]\w+', clean_name) and not clean_name.upper().startswith(('MG LIC', 'MIG LIC', 'NO ', 'ADD NEW', 'MEDICINE BRAND')):
                extracted["name"] = clean_name
                break

    if not extracted["name"]:
        if extracted["batchNumber"]:
            extracted["name"] = f"Medicine {extracted['batchNumber']}"
        else:
            extracted["name"] = ""

    return extracted
