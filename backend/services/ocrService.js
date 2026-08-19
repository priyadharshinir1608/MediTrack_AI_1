const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const env = require('../config/env');

const scanMedicineImage = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));

    const response = await axios.post(`${env.aiServiceUrl}/ocr`, formData, {
      headers: formData.getHeaders(),
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    console.warn('[OCR Service] Flask microservice call fallback:', error.message);
    return {
      success: false,
      data: {
        name: 'Paracetamol 500mg (AI Extracted)',
        batchNumber: 'B-98745',
        expiryDate: '2026-12-31',
        manufacturer: 'MedLab Pharma',
        category: 'Tablet'
      }
    };
  }
};

module.exports = {
  scanMedicineImage
};
