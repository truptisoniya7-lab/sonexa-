const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, initPostgresDB } = require('./config/db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const friendRoutes = require('./routes/friends');
const spotifyRoutes = require('./routes/spotify');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const communityRoutes = require('./routes/communities');
const notificationRoutes = require('./routes/notifications');

// Initialize DB (non-blocking)
initPostgresDB().catch(err => console.error('Failed to initialize database', err));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes(pool));
app.use('/friends', friendRoutes(pool));
app.use('/spotify', spotifyRoutes(pool));
app.use('/rooms', roomRoutes(pool));
app.use('/messages', messageRoutes(pool));
app.use('/communities', communityRoutes(pool));
app.use('/notifications', notificationRoutes(pool));

// If running directly (e.g. nodemon), start the server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
