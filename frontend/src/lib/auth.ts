import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getPool } from './db';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

export async function findUserByEmail(email: string) {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createGoogleUser(email: string, name: string, googleId: string, profilePicture: string) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO Users (email, name, google_id, profile_picture, provider, updated_at) 
     VALUES ($1, $2, $3, $4, 'google', CURRENT_TIMESTAMP) RETURNING *`,
    [email, name, googleId, profilePicture]
  );
  return result.rows[0];
}

export function generateToken(user: { id: number }) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'super_secret_key', { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
}
