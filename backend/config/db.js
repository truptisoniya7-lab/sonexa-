const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    `);
    console.log('PostgreSQL database initialized for Auth.');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
  }
};

module.exports = { pool, initPostgresDB };
