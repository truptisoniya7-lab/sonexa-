const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'sonexa-super-secret-jwt-key';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

const login = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    let userResult = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    let user = userResult.rows[0];
    if (!user) {
      const result = await pool.query(
        'INSERT INTO Users (email, name, password_hash, provider) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, name || email.split('@')[0], password, 'local']
      );
      user = result.rows[0];
    } else {
      if (user.password_hash !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, provider: user.provider } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    let userResult = await pool.query('SELECT * FROM Users WHERE google_id = $1 OR email = $2', [googleId, email]);
    let user = userResult.rows[0];
    
    if (!user) {
      const insertResult = await pool.query(
        'INSERT INTO Users (email, name, google_id, profile_picture, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [email, name, googleId, picture, 'google']
      );
      user = insertResult.rows[0];
    } else if (!user.google_id) {
      const updateResult = await pool.query(
        'UPDATE Users SET google_id = $1, profile_picture = $2, provider = $3 WHERE email = $4 RETURNING *',
        [googleId, picture, 'google', email]
      );
      user = updateResult.rows[0];
    }
    
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.profile_picture } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  login,
  googleLogin
};
