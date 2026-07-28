const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true })); // Enable credentials for cookies
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const friendRoutes = require('./routes/friends');
const musicRoutes = require('./routes/music');
const historyRoutes = require('./routes/history');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const communityRoutes = require('./routes/communities');
const notificationRoutes = require('./routes/notifications');
const recommendationsRoutes = require('./routes/recommendations');
const libraryRoutes = require('./routes/library');

app.use('/auth', authRoutes);
app.use('/profile', typeof profileRoutes === 'function' ? profileRoutes() : profileRoutes);
app.use('/friends', typeof friendRoutes === 'function' ? friendRoutes() : friendRoutes);
app.use('/music', typeof musicRoutes === 'function' ? musicRoutes() : musicRoutes);
app.use('/history', typeof historyRoutes === 'function' ? historyRoutes() : historyRoutes);
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);
app.use('/communities', communityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/recommendations', recommendationsRoutes);
app.use('/library', libraryRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
