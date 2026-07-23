const { pool } = require('../config/db');

const getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await pool.query('SELECT id, email, name, profile_picture, provider, created_at FROM Users WHERE id = $1', [id]);
    const user = userResult.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const streamingAccountsResult = await pool.query('SELECT provider as platform, access_token as platform_user_id, created_at as updated_at FROM StreamingAccounts WHERE user_id = $1', [id]);
    user.streaming_accounts = streamingAccountsResult.rows;
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const result = await pool.query('UPDATE Users SET name = $1 WHERE id = $2 RETURNING id, email, name, profile_picture, provider', [name, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
