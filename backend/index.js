const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const { initPostgresDB } = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  await initPostgresDB(); // Initialize PostgreSQL for Auth/Users

  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Connected to SQLite database.');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS StreamingAccounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        provider TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, provider)
    );

    CREATE TABLE IF NOT EXISTS Friendships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id1 INTEGER,
        user_id2 INTEGER,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id1, user_id2)
    );

    CREATE TABLE IF NOT EXISTS Rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        host_id INTEGER,
        current_song_uri TEXT,
        is_playing BOOLEAN DEFAULT 0,
        progress_ms INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS RoomMembers (
        room_id INTEGER,
        user_id INTEGER,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id),
        FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        song_uri TEXT NOT NULL,
        song_title TEXT,
        song_artist TEXT,
        song_image TEXT,
        added_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        queue_id INTEGER,
        user_id INTEGER,
        vote_type INTEGER,
        UNIQUE(queue_id, user_id),
        FOREIGN KEY (queue_id) REFERENCES Queue(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        user_id INTEGER,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CommunityMembers (
        community_id INTEGER,
        user_id INTEGER,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (community_id, user_id),
        FOREIGN KEY (community_id) REFERENCES Communities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CommunitySongs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        community_id INTEGER,
        song_uri TEXT NOT NULL,
        song_title TEXT,
        song_artist TEXT,
        song_image TEXT,
        added_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (community_id) REFERENCES Communities(id) ON DELETE CASCADE
    );
  `);
  
  // Routes
  const authRoutes = require('./routes/auth');
  const profileRoutes = require('./routes/profile');
  const friendRoutes = require('./routes/friends');
  const spotifyRoutes = require('./routes/spotify');
  const roomRoutes = require('./routes/rooms');
  const messageRoutes = require('./routes/messages');
  const communityRoutes = require('./routes/communities');
  const notificationRoutes = require('./routes/notifications');

  app.use('/auth', authRoutes);
  app.use('/profile', profileRoutes(db));
  app.use('/friends', friendRoutes(db));
  app.use('/spotify', spotifyRoutes(db));
  app.use('/rooms', roomRoutes(db));
  app.use('/messages', messageRoutes(db));
  app.use('/communities', communityRoutes(db));
  app.use('/notifications', notificationRoutes(db));

  // Socket.IO Logic
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User left room ${roomId}`);
    });

    socket.on('add_to_queue', (data) => {
      io.to(data.roomId).emit('queue_updated', data);
    });

    socket.on('remove_from_queue', (data) => {
      io.to(data.roomId).emit('queue_updated', data);
    });

    socket.on('vote', (data) => {
      io.to(data.roomId).emit('vote_updated', data);
    });

    socket.on('sync_playback', (data) => {
      socket.to(data.roomId).emit('playback_synced', data);
    });

    socket.on('send_message', (data) => {
      io.to(data.roomId).emit('new_message', data);
    });

    socket.on('reaction', (data) => {
      io.to(data.roomId).emit('new_reaction', data);
    });

    socket.on('webrtc_offer', (data) => {
      socket.to(data.targetSocketId).emit('webrtc_offer', {
        offer: data.offer,
        callerId: data.callerId,
        callerSocketId: socket.id
      });
    });

    socket.on('webrtc_answer', (data) => {
      socket.to(data.targetSocketId).emit('webrtc_answer', {
        answer: data.answer,
        answererSocketId: socket.id
      });
    });

    socket.on('webrtc_ice_candidate', (data) => {
      socket.to(data.targetSocketId).emit('webrtc_ice_candidate', {
        candidate: data.candidate,
        senderSocketId: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

initDB().catch(err => {
  console.error('Failed to initialize databases', err);
});
