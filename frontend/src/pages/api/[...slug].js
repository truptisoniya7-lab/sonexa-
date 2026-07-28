const app = require('../../../backend/index.js');

export const config = {
  api: {
    externalResolver: true, // Tell Next.js that Express handles the response
  },
};

export default function handler(req, res) {
  try {
    // Strip /api from the URL so that the Express router matches correctly.
    if (req.url && req.url.startsWith('/api')) {
      req.url = req.url.replace('/api', '');
    }
    if (req.url === '') {
      req.url = '/';
    }
    return app(req, res);
  } catch (error) {
    console.error("CRITICAL API WRAPPER ERROR:", error);
    return res.status(500).json({
      error: "Next.js API Wrapper Crash",
      message: error.message,
      stack: error.stack,
      appType: typeof app
    });
  }
}
