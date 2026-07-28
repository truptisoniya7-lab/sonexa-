const app = require('../backend/index.js');

module.exports = (req, res) => {
  // Strip /api prefix so Express routes match correctly
  // e.g. /api/auth/login -> /auth/login
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }

  return app(req, res);
};
