// Health check endpoint
module.exports = (req, res) => {
  try {
    res.status(200).json({ 
      status: 'ok', 
      message: 'API funcionando no Vercel',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
