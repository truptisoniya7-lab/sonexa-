import app from '../../../backend/index.js';

export const config = {
  api: {
    bodyParser: false, // Let Express handle body parsing
    externalResolver: true, // Tell Next.js that Express handles the response
  },
};

export default function handler(req, res) {
  // Strip /api from the URL so that the Express router matches correctly.
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace('/api', '');
  }
  if (req.url === '') {
    req.url = '/';
  }
  return app(req, res);
}
