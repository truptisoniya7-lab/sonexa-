const { pool } = require('./config/db');

async function mockConnection() {
  try {
    await pool.query(
      `INSERT INTO StreamingAccounts (user_id, provider, access_token, refresh_token) 
       VALUES (1, 'spotify', 'mock_access_token', 'mock_refresh_token') 
       ON CONFLICT (user_id, provider) 
       DO UPDATE SET access_token = 'mock_access_token'`
    );
    console.log('Mock Spotify connection added!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

mockConnection();
