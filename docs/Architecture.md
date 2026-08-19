# MedScan AI — System Architecture

```text
                               ┌─────────────────────────┐
                               │      React (Vite)       │
                               └────────────┬────────────┘
                                            │
                                            ▼
                                 Firebase Authentication
                                            │
                                            ▼
                                    Node.js (Express)
                              ┌─────────────┴─────────────┐
                              │                           │
                              ▼                           ▼
                       MongoDB Atlas               Firebase Firestore
                      (users, medicines,          (notifications,
                       suppliers, sales,           activityLogs)
                       purchases, stock)
                              │
                              ▼
                         Python Flask
                   (OpenCV + EasyOCR + ML)
```

## System Layers

1. **Frontend**: Built with React (Vite), featuring custom Dark Glassmorphism CSS design tokens, Chart.js for analytics, and Firebase Web Auth.
2. **Backend**: Express REST API acting as the central hub. Handles authentication verification, Mongoose database models, dynamic report calculations, and proxies image OCR calls to Python.
3. **AI Microservice**: Python Flask service integrating OpenCV image preprocessing, EasyOCR text recognition, PyZBar barcode decoding, and Scikit-Learn predictive algorithms.
4. **Cloud Databases**:
   - **MongoDB Atlas**: Primary database for application entity storage (`users`, `medicines`, `suppliers`, `sales`, `purchases`).
   - **Firebase Firestore**: Dedicated real-time data layer for `notifications` and `activityLogs`.
