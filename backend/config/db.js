const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Force Node.js DNS to prefer IPv4 over IPv6 on Windows to eliminate NAT64 ECONNRESET & ENOTFOUND
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Safe ignore if older node version
}

// Connection lifecycle event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection dropped. Driver will automatically attempt to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected successfully to Atlas cluster.');
});

mongoose.connection.on('error', (err) => {
  console.warn('[MongoDB] Connection warning:', err.message);
});

const connectDB = async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(env.mongoURI, {
        serverSelectionTimeoutMS: 6000, // Short timeout prevents event loop lockup
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        maxIdleTimeMS: 60000, // Close idle connections before Atlas closes them
        heartbeatFrequencyMS: 10000, // Rapidly detect connection recovery after sleep/wake
        family: 4 // Explicitly force IPv4 to avoid IPv6 NAT64 resets on Atlas
      });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
      return true;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.warn(`[MongoDB] Connection Notice: ${error.message}. Running in fallback/degraded mode.`);
        return false;
      }
      const delay = attempt * 2500;
      console.warn(`[MongoDB] Connection attempt ${attempt} failed: ${error.message}. Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
