import cv2
import re

def detect_barcode(cv_image):
    """
    Detect and decode barcodes using OpenCV's built-in BarcodeDetector
    or fallback pattern matching.
    """
    barcode_data = []
    try:
        # OpenCV built-in barcode detector (OpenCV 4.7+)
        detector = cv2.barcode.BarcodeDetector()
        ok, decoded_info, decoded_type, _ = detector.detectAndDecode(cv_image)
        if ok and decoded_info:
            for info in decoded_info:
                if info:
                    barcode_data.append(info)
    except Exception as e:
        print(f"[Barcode Detector] OpenCV Detector notice: {e}")

    # Fallback to PyZBar if available
    if not barcode_data:
        try:
            from pyzbar import pyzbar
            barcodes = pyzbar.decode(cv_image)
            for b in barcodes:
                barcode_data.append(b.data.decode('utf-8'))
        except ImportError:
            pass
        except Exception as e:
            print(f"[Barcode Detector] PyZBar notice: {e}")

    return barcode_data[0] if barcode_data else None
