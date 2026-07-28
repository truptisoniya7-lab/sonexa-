const app = require('../backend/index.js');

module.exports = (req, res) => {
  // Strip /api from the URL because Express expects routes like /auth/login
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  return app(req, res);
};
