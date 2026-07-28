const { supabase } = require('../config/db');

const getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, profile_picture, provider, created_at')
      .eq('id', id)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { data: streamingAccounts, error: streamingAccountsError } = await supabase
      .from('streaming_accounts')
      .select('platform:provider, platform_user_id:access_token, updated_at:created_at')
      .eq('user_id', id);
      
    if (streamingAccountsError) throw streamingAccountsError;

    const user = userData;
    user.streaming_accounts = streamingAccounts || [];
    
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
    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', id)
      .select('id, email, name, profile_picture, provider');
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: data[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
