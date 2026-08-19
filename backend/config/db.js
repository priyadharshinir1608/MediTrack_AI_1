const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(env.mongoURI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
      return true;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.warn(`[MongoDB] Connection Warning: ${error.message}. Running in fallback/degraded mode.`);
        return false;
      }

      console.warn(`[MongoDB] Connection attempt ${attempt} failed: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

module.exports = connectDB;
