const authService = require('../services/authService');

const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Missing credential' });
  }

  try {
    const payload = await authService.verifyGoogleToken(credential);
    const { email, name, sub: googleId, picture: profilePicture } = payload;

    let user = await authService.findUserByEmail(email);

    if (!user) {
      user = await authService.createGoogleUser(email, name, googleId, profilePicture);
    } else if (!user.google_id) {
      // If user exists but lacks google_id, we could update them, but for now we proceed
    }

    const token = authService.generateToken(user);

    res.json({ token, user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      profile_picture: user.profile_picture,
      provider: user.provider
    }});
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
};

const localLogin = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const { pool } = require('../config/db');
    let userResult = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    let user = userResult.rows[0];
    
    if (!user) {
      const result = await pool.query(
        'INSERT INTO Users (email, name, password_hash, provider) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, name || email.split('@')[0], password, 'local']
      );
      user = result.rows[0];
    } else {
      // Very basic password check to match old SQLite mock logic
      if (user.password_hash !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const token = authService.generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, provider: user.provider } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  googleLogin,
  localLogin
};
