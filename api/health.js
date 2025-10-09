// Health check endpoint
module.exports = function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API funcionando no Vercel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
