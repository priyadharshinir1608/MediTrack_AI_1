const errorHandler = (err, req, res, next) => {
  // Gracefully handle momentary database drops (e.g. laptop waking from sleep, Wi-Fi reconnect)
  if (err.name === 'MongoServerSelectionError' || err.message?.includes('ENOTFOUND') || err.message?.includes('ECONNRESET')) {
    console.warn(`[Database Notice] MongoDB is momentarily reconnecting: ${err.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database is momentarily reconnecting. Please retry in a few seconds.'
    });
  }

  console.error('[Error Handler]', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
