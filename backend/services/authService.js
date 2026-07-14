const { pool } = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
  return result.rows[0];
};

const createGoogleUser = async (email, name, googleId, profilePicture) => {
  const result = await pool.query(
    `INSERT INTO Users (email, name, google_id, profile_picture, provider, updated_at) 
     VALUES ($1, $2, $3, $4, 'google', CURRENT_TIMESTAMP) RETURNING *`,
    [email, name, googleId, profilePicture]
  );
  return result.rows[0];
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'super_secret_key', { expiresIn: '1d' });
};

module.exports = {
  verifyGoogleToken,
  findUserByEmail,
  createGoogleUser,
  generateToken
};
