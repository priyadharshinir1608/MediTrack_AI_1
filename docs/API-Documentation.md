# MedScan AI — API Endpoint Reference

## Base URLs
- **Backend API**: `http://localhost:5000/api`
- **AI Microservice**: `http://localhost:8000`

---

## 1. System Health
- `GET /api/health` — Checks status of Express server, MongoDB connection, Firestore, and Python AI service.

## 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Registers MongoDB user doc after Firebase Auth creation.
- `POST /api/auth/sync` — Syncs authenticated user profile.
- `GET /api/auth/profile` — Fetches current user profile.
- `PUT /api/auth/profile` — Updates user profile.

## 3. Medicine Inventory (`/api/medicines`)
- `GET /api/medicines` — Search, filter, and list medicines.
- `GET /api/medicines/:id` — Get single medicine details.
- `POST /api/medicines` — Create new medicine record.
- `PUT /api/medicines/:id` — Update medicine details.
- `DELETE /api/medicines/:id` — Delete medicine.
- `POST /api/medicines/upload` — Upload medicine box image for AI OCR & Barcode extraction.

## 4. Stock & Alerts (`/api/stock`)
- `GET /api/stock/low-stock` — Fetch medicines below threshold.
- `GET /api/stock/expiry-alerts` — Fetch medicines expiring within N days.
- `PUT /api/stock/update/:id` — Quick adjust inventory quantity.

## 5. Analytics & Reports (`/api/reports`)
- `GET /api/reports/sales` — Aggregate sales revenue & monthly trends.
- `GET /api/reports/stock` — Inventory breakdown by category.

## 6. Notifications (`/api/notifications`)
- `GET /api/notifications` — Real-time notification feed from Firestore.
- `PUT /api/notifications/:id/read` — Mark notification as read.

## 7. AI Microservice (`:8000`)
- `GET /health` — Microservice health status.
- `POST /ocr` — Image preprocessing + EasyOCR + Barcode extraction.
- `POST /ml/predict-low-stock` — Stockout risk estimation.
- `POST /ml/predict-expiry` — Expiry risk score calculation.
- `POST /ml/predict-demand` — Linear regression sales demand forecast.
