import cv2
import numpy as np

def preprocess_image(image_bytes_or_path):
    """
    Enhance medicine label image quality for OCR text recognition.
    Applies Grayscale, Denoising, Gaussian Blur, and Adaptive Thresholding.
    """
    if isinstance(image_bytes_or_path, str):
        img = cv2.imread(image_bytes_or_path)
    else:
        nparr = np.frombuffer(image_bytes_or_path, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image")

    # 1. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Denoising & Contrast Adjustment
    denoised = cv2.fastNlMeansDenoising(gray, h=10)

    # 3. CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    return img, enhanced
