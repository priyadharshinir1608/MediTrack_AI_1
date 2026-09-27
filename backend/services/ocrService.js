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
      timeout: 60000
    });

    return response.data;
  } catch (error) {
    console.warn('[OCR Service] AI microservice notice:', error.message);
    return {
      success: false,
      message: 'AI OCR service processing timed out or encountered an issue. Please enter specifications manually.'
    };
  }
};

module.exports = {
  scanMedicineImage
};
