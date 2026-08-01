const { supabase } = require('../config/db');

// GET /friends/list
const getFriends = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('user1:users!user_id1(id, email, name, profile_picture), user2:users!user_id2(id, email, name, profile_picture)')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`)
      .eq('status', 'accepted');

    if (error) throw error;

    const friends = data.map(f => {
      const friendUser = f.user1?.id === currentUserId ? f.user2 : f.user1;
      return {
        id: friendUser?.id,
        username: friendUser?.name,
        name: friendUser?.name,
        email: friendUser?.email,
        avatar: friendUser?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendUser?.id}`,
        online: Math.random() > 0.5, // Mock online status for now
        status: 'Online',
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /friends/requests
const getRequests = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id, user1:users!user_id1(id, email, name, profile_picture)')
      .eq('user_id2', currentUserId)
      .eq('status', 'pending');

    if (error) throw error;

    const { data: myAcceptedFriendships } = await supabase
      .from('friendships')
      .select('user_id1, user_id2')
      .eq('status', 'accepted')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);
      
    const myFriendIds = new Set(
      (myAcceptedFriendships || []).map(f => f.user_id1 === currentUserId ? f.user_id2 : f.user_id1)
    );

    const senderIds = data.map(req => req.user1?.id).filter(id => id);
    let theirFriendships = [];
    if (senderIds.length > 0) {
      const { data: theirFriendsData } = await supabase
        .from('friendships')
        .select('user_id1, user_id2')
        .eq('status', 'accepted')
        .or(`user_id1.in.(${senderIds.join(',')}),user_id2.in.(${senderIds.join(',')})`);
      theirFriendships = theirFriendsData || [];
    }

    const requests = data.map(f => {
      let mutualCount = 0;
      theirFriendships.forEach(friendship => {
        if (friendship.user_id1 === f.user1?.id || friendship.user_id2 === f.user1?.id) {
          const otherId = friendship.user_id1 === f.user1?.id ? friendship.user_id2 : friendship.user_id1;
          if (myFriendIds.has(otherId)) mutualCount++;
        }
      });

      return {
        id: f.id,
        senderId: f.user1?.id,
        username: f.user1?.name,
        name: f.user1?.name,
        avatar: f.user1?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.user1?.id}`,
        mutualFriends: mutualCount
      };
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /friends/request
const inviteFriend = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  const { targetUserId } = req.body;
  
  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });
  if (currentUserId === targetUserId) return res.status(400).json({ error: 'Cannot add yourself' });

  try {
    const { data: existing, error: checkError } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id1.eq.${currentUserId},user_id2.eq.${targetUserId}),and(user_id1.eq.${targetUserId},user_id2.eq.${currentUserId})`);

    if (checkError) throw checkError;
    
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists or users are already friends' });
    }
    
    const { data, error } = await supabase
      .from('friendships')
      .insert([{ user_id1: currentUserId, user_id2: targetUserId, status: 'pending' }])
      .select()
      .single();
      
    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /friends/accept
const acceptFriend = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  const { requestId, senderId } = req.body;
  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let query = supabase.from('friendships').update({ status: 'accepted' });
    
    if (requestId) {
      query = query.eq('id', requestId).eq('user_id2', currentUserId);
    } else if (senderId) {
      query = query.eq('user_id1', senderId).eq('user_id2', currentUserId);
    } else {
      return res.status(400).json({ error: 'requestId or senderId required' });
    }

    const { data, error } = await query.select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error accepting friend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /friends/decline
const declineFriend = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  const { requestId, senderId } = req.body;
  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let query = supabase.from('friendships').delete();
    
    if (requestId) {
      query = query.eq('id', requestId).eq('user_id2', currentUserId);
    } else if (senderId) {
      query = query.eq('user_id1', senderId).eq('user_id2', currentUserId);
    } else {
      return res.status(400).json({ error: 'requestId or senderId required' });
    }

    const { error } = await query;
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error declining friend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /friends/cancel
const cancelFriend = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  const { targetUserId } = req.body;
  if (!currentUserId || !targetUserId) return res.status(400).json({ error: 'targetUserId required' });

  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id1', currentUserId)
      .eq('user_id2', targetUserId)
      .eq('status', 'pending');

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling friend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// DELETE /friends/:id
const removeFriend = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  const { id: friendId } = req.params;
  if (!currentUserId || !friendId) return res.status(400).json({ error: 'friendId required' });

  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id1.eq.${currentUserId},user_id2.eq.${friendId}),and(user_id1.eq.${friendId},user_id2.eq.${currentUserId})`)
      .eq('status', 'accepted');

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /friends/suggestions
const getSuggestions = async (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;
  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Basic recommendation: get random users not already friends
    // 1. Get friend IDs
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id1, user_id2')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);
      
    const friendIds = new Set(
      (friendships || []).map(f => f.user_id1 === currentUserId ? f.user_id2 : f.user_id1)
    );
    friendIds.add(currentUserId);

    // 2. Fetch users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, profile_picture')
      .limit(50);
      
    if (error) throw error;

    const candidateUsers = users.filter(u => !friendIds.has(u.id)).sort(() => 0.5 - Math.random()).slice(0, 5);
    const candidateIds = candidateUsers.map(u => u.id);

    let theirFriendships = [];
    if (candidateIds.length > 0) {
      const { data: theirFriendsData } = await supabase
        .from('friendships')
        .select('user_id1, user_id2')
        .eq('status', 'accepted')
        .or(`user_id1.in.(${candidateIds.join(',')}),user_id2.in.(${candidateIds.join(',')})`);
      theirFriendships = theirFriendsData || [];
    }

    // Filter out existing friends & current user, then take random 5
    const suggestions = candidateUsers.map(u => {
      let mutualCount = 0;
      theirFriendships.forEach(friendship => {
        if (friendship.user_id1 === u.id || friendship.user_id2 === u.id) {
          const otherId = friendship.user_id1 === u.id ? friendship.user_id2 : friendship.user_id1;
          if (myFriendIds.has(otherId)) mutualCount++;
        }
      });

      return {
        id: u.id,
        name: u.name,
        username: u.name,
        avatar: u.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
        status: 'People You May Know',
        mutualFriends: mutualCount
      };
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getFriends,
  getRequests,
  inviteFriend,
  acceptFriend,
  declineFriend,
  cancelFriend,
  removeFriend,
  getSuggestions
};
