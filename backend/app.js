const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const env = require('./config/env');
const { firebaseInitialized } = require('./config/firebase');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const stockRoutes = require('./routes/stockRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Comprehensive Health Endpoint
app.get('/api/health', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const firestoreStatus = firebaseInitialized ? 'Connected' : 'Mock/Development Mode';

  let pythonStatus = 'Disconnected';
  try {
    const aiRes = await axios.get(`${env.aiServiceUrl}/health`, { timeout: 2000 });
    if (aiRes.data && aiRes.data.status === 'OK') {
      pythonStatus = 'Connected';
    }
  } catch (err) {
    pythonStatus = 'Offline / Not reachable';
  }

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      backend: 'Running',
      mongodb: mongoStatus,
      firestore: firestoreStatus,
      aiService: pythonStatus
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
