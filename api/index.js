const { app } = require('../backend/dist/app');
const { connectMongo } = require('../backend/dist/config/mongodb');

let isConnected = false;

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version,Authorization'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure MongoDB connection is established
  if (!isConnected) {
    try {
      await connectMongo();
      isConnected = true;
      console.info('MongoDB connected for Vercel');
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
      return;
    }
  }

  // Use Express app as middleware
  await new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  }).catch((error) => {
    console.error('Request error:', error);
    if (!res.writableEnded) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });
};
