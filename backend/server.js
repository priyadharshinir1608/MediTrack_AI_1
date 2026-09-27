const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initAlertScheduler } = require('./services/alertScheduler');

const PORT = env.port;

const startServer = async () => {
  await connectDB();

  // Initialize Daily Automated Expiry & Low Stock Alert Scheduler
  initAlertScheduler();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 🚀 MedScan AI Backend API running on port ${PORT}`);
    console.log(` 🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(` 🔔 Daily Alert Scheduler: Active (Dynamic Minute Cron - Gmail & WhatsApp)`);
    console.log(`==================================================`);
  });
};

startServer();
