const { supabase } = require('../config/db');

const getFriends = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('status, user1:users!user_id1(id, email, name), user2:users!user_id2(id, email, name)')
      .or(`user_id1.eq.${id},user_id2.eq.${id}`);

    if (error) throw error;

    const friends = data.map(f => {
      const friendUser = f.user1?.id === id ? f.user2 : f.user1;
      return {
        id: friendUser?.id,
        email: friendUser?.email,
        name: friendUser?.name,
        status: f.status
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const inviteFriend = async (req, res) => {
  const { userId1, userId2 } = req.body;
  
  if (!userId1 || !userId2) {
    return res.status(400).json({ error: 'userId1 and userId2 are required' });
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id1.eq.${userId1},user_id2.eq.${userId2}),and(user_id1.eq.${userId2},user_id2.eq.${userId1})`);

    if (checkError) throw checkError;
    
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Friend request already sent or users are already friends' });
    }
    
    const { data, error } = await supabase
      .from('friendships')
      .insert([{ user_id1: userId1, user_id2: userId2, status: 'pending' }])
      .select()
      .single();
      
    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getFriends,
  inviteFriend
};
