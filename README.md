# MediTrack AI — Full-Stack Pharmacy Management System

MediTrack AI is a modular, AI-powered pharmacy and medicine inventory management platform designed for modern healthcare facilities.

## Architecture

- **Frontend**: React (Vite), Vanilla CSS (Custom Design Tokens), React Router v6, Chart.js, Firebase Auth Client SDK
- **Backend**: Node.js, Express.js, Mongoose (MongoDB Atlas), Firebase Admin SDK (Firestore Real-time notifications & activity logs)
- **AI Microservice**: Python (Flask), OpenCV, EasyOCR, PyZBar (Barcode Reader), Scikit-Learn
- **Databases**:
  - **MongoDB Atlas**: Permanent store for Users, Medicines, Suppliers, Sales, Purchases, Stock
  - **Firebase Firestore**: Real-time notifications & activity logs

## Directory Structure

```text
MediTrack AI/
├── frontend/          # React (Vite) UI Application
├── backend/           # Node.js Express REST API
├── ai-service/        # Python Flask AI & OCR Service
├── database/          # Database schemas & sample Firestore docs
└── docs/              # Architecture diagrams & documentation
```

## Quick Start

### 1. Backend Service
```bash
cd backend
npm install
npm run dev
```

### 2. AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### 3. Frontend App
```bash
cd frontend
npm install
npm run dev
```
============================================================================
============================================================================

##backend

$env:Path = "C:\Program Files\nodejs;$env:Path"
cd "D:\MediTrack AI\backend"
npm run dev

##frontend

$env:Path = "C:\Program Files\nodejs;$env:Path"
cd "D:\MediTrack AI\frontend"
npm run dev

##Ai-service

& "C:\Program Files\Python314\python.exe"
cd "D:\MediTrack AI\ai-service"
python app.py