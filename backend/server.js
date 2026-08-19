const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const PORT = env.port;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 🚀 MedScan AI Backend API running on port ${PORT}`);
    console.log(` 🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
};

startServer();
