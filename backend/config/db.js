const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(env.mongoURI, {
        serverSelectionTimeoutMS: 15000, // Increased from 5s → 15s for Atlas cold start
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
      return true;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.warn(`[MongoDB] Connection Warning: ${error.message}. Running in fallback/degraded mode.`);
        return false;
      }
      const delay = attempt * 3000; // progressive backoff: 3s, 6s, 9s...
      console.warn(`[MongoDB] Connection attempt ${attempt} failed: ${error.message}. Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
