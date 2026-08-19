import re
from datetime import datetime

def clean_text(text):
    """Clean raw OCR text output."""
    if not text:
        return ""
    text = re.sub(r'[\r\n]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_date(date_str):
    """Attempt to parse common date formats on medicine labels."""
    if not date_str:
        return None
    
    date_patterns = [
        r'(\d{2})[/.-](\d{4})',       # MM/YYYY or MM.YYYY
        r'(\d{2})[/.-](\d{2})[/.-](\d{4})', # DD/MM/YYYY
        r'(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[/.-]?(\d{4})',
        r'(\d{2})[/\s]?(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[/\s]?(\d{4})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, date_str, re.IGNORECASE)
        if match:
            return match.group(0)
    return date_str
