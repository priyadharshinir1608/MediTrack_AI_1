import cv2
import re

def _extract_strings(obj):
    """
    Safely extracts non-empty decoded string(s) from OpenCV result structures
    without evaluating truthiness of NumPy arrays.
    """
    results = []
    if obj is None:
        return results
    if isinstance(obj, str):
        cleaned = obj.strip()
        if len(cleaned) > 0:
            results.append(cleaned)
    elif isinstance(obj, bytes):
        try:
            cleaned = obj.decode('utf-8', errors='ignore').strip()
            if len(cleaned) > 0:
                results.append(cleaned)
        except Exception:
            pass
    elif isinstance(obj, (list, tuple)):
        for item in obj:
            results.extend(_extract_strings(item))
    return results

def detect_barcode(cv_image):
    """
    Detect and decode barcodes using OpenCV's BarcodeDetector
    with fallback to detectAndDecodeMulti and PyZBar.
    """
    barcode_data = []

    # 1. OpenCV BarcodeDetector (Single/Standard)
    try:
        detector = cv2.barcode.BarcodeDetector()
        res = detector.detectAndDecode(cv_image)
        if res is not None and len(res) > 0:
            # res[0] is decoded_info (str or list of str)
            found = _extract_strings(res[0])
            barcode_data.extend(found)
    except Exception as e:
        print(f"[Barcode Detector] OpenCV Detector notice: {e}")

    # 2. OpenCV BarcodeDetector (Multi-barcode support)
    if not barcode_data:
        try:
            detector = cv2.barcode.BarcodeDetector()
            res_multi = detector.detectAndDecodeMulti(cv_image)
            if res_multi is not None and len(res_multi) >= 2:
                # detectAndDecodeMulti returns (ok, decoded_info, decoded_type, points)
                found = _extract_strings(res_multi[1])
                barcode_data.extend(found)
        except Exception:
            pass

    # 3. Fallback to PyZBar if available
    if not barcode_data:
        try:
            from pyzbar import pyzbar
            barcodes = pyzbar.decode(cv_image)
            for b in barcodes:
                if b.data:
                    val = b.data.decode('utf-8', errors='ignore').strip()
                    if len(val) > 0:
                        barcode_data.append(val)
        except ImportError:
            pass
        except Exception as e:
            print(f"[Barcode Detector] PyZBar notice: {e}")

    return barcode_data[0] if barcode_data else None
