const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'sonexa-super-secret-jwt-key';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (fetchError) throw fetchError;

    let user = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

    if (!user) {
      return res.status(401).json({ error: 'User does not exist. Please sign up.' });
    } else {
      if (user.password_hash !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.display_name, provider: user.provider } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const signup = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (fetchError) throw fetchError;

    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email.' });
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, display_name: name || email.split('@')[0], username: email.split('@')[0], password_hash: password, provider: 'local' }])
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    const token = generateToken(newUser);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.display_name, provider: newUser.provider } });
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
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .or(`google_id.eq.${googleId},email.eq.${email}`);
      
    if (usersError) throw usersError;

    let user = usersData && usersData.length > 0 ? usersData[0] : null;
    
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ email, display_name: name, username: email.split('@')[0], google_id: googleId, avatar: picture, provider: 'google' }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      user = newUser;
    } else if (!user.google_id) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ google_id: googleId, avatar: picture, provider: 'google' })
        .eq('email', email)
        .select()
        .single();
        
      if (updateError) throw updateError;
      user = updatedUser;
    }
    
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.display_name, picture: user.avatar } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  login,
  signup,
  googleLogin
};
