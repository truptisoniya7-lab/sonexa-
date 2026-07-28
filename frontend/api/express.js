const app = require('../../backend/index.js');

module.exports = (req, res) => {
  // Strip /api from the URL so that the Express router matches correctly.
  // For example, /api/auth becomes /auth
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  if (!req.url || req.url === '') {
    req.url = '/';
  }
  
  // Forward the request to the Express application
  return app(req, res);
};
