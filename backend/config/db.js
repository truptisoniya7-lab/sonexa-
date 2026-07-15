const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initPostgresDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        google_id TEXT UNIQUE,
        profile_picture TEXT,
        provider TEXT DEFAULT 'local',
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS StreamingAccounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        provider TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, provider)
      );

      CREATE TABLE IF NOT EXISTS Friendships (
        id SERIAL PRIMARY KEY,
        user_id1 INTEGER,
        user_id2 INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id1, user_id2)
      );

      CREATE TABLE IF NOT EXISTS Rooms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        host_id INTEGER,
        current_song_uri TEXT,
        is_playing BOOLEAN DEFAULT false,
        progress_ms INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS RoomMembers (
        room_id INTEGER,
        user_id INTEGER,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id),
        FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Queue (
        id SERIAL PRIMARY KEY,
        room_id INTEGER,
        song_uri TEXT NOT NULL,
        song_title TEXT,
        song_artist TEXT,
        song_image TEXT,
        added_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Votes (
        id SERIAL PRIMARY KEY,
        queue_id INTEGER,
        user_id INTEGER,
        vote_type INTEGER,
        UNIQUE(queue_id, user_id),
        FOREIGN KEY (queue_id) REFERENCES Queue(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER,
        user_id INTEGER,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Communities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS CommunityMembers (
        community_id INTEGER,
        user_id INTEGER,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (community_id, user_id),
        FOREIGN KEY (community_id) REFERENCES Communities(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS CommunitySongs (
        id SERIAL PRIMARY KEY,
        community_id INTEGER,
        song_uri TEXT NOT NULL,
        song_title TEXT,
        song_artist TEXT,
        song_image TEXT,
        added_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (community_id) REFERENCES Communities(id) ON DELETE CASCADE
      );
    `);
    console.log('PostgreSQL database initialized.');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
  }
};

module.exports = { pool, initPostgresDB };
