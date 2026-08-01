const { supabase } = require('../config/db');

const searchUsers = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  const currentUserId = req.user?.userId || req.user?.id;
  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Find matching users excluding current user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .neq('id', currentUserId)
      .ilike('name', `%${query}%`)
      .limit(20);

    if (usersError) throw usersError;
    if (!users || users.length === 0) return res.json([]);

    // 2. Fetch friendship statuses involving current user and the found users
    const userIds = users.map(u => u.id);
    const { data: friendships, error: friendError } = await supabase
      .from('friendships')
      .select('user_id1, user_id2, status')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);

    if (friendError) throw friendError;

    // 2.5 Fetch ALL accepted friendships to calculate true mutual friends
    const { data: myAcceptedFriendships } = await supabase
      .from('friendships')
      .select('user_id1, user_id2')
      .eq('status', 'accepted')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);
      
    const myFriendIds = new Set(
      (myAcceptedFriendships || []).map(f => f.user_id1 === currentUserId ? f.user_id2 : f.user_id1)
    );

    const { data: theirFriendships } = await supabase
      .from('friendships')
      .select('user_id1, user_id2')
      .eq('status', 'accepted')
      .or(`user_id1.in.(${userIds.join(',')}),user_id2.in.(${userIds.join(',')})`);

    // 3. Map users to add friendshipStatus and exact mutual friends
    const enrichedUsers = users.map(user => {
      let friendshipStatus = 'none';
      
      const friendship = friendships?.find(f => 
        (f.user_id1 === currentUserId && f.user_id2 === user.id) ||
        (f.user_id2 === currentUserId && f.user_id1 === user.id)
      );

      if (friendship) {
        if (friendship.status === 'accepted') {
          friendshipStatus = 'friends';
        } else if (friendship.status === 'pending') {
          if (friendship.user_id1 === currentUserId) {
            friendshipStatus = 'pending'; // We sent it
          } else {
            friendshipStatus = 'incoming'; // They sent it
          }
        }
      }

      let mutualCount = 0;
      (theirFriendships || []).forEach(f => {
        if (f.user_id1 === user.id || f.user_id2 === user.id) {
          const otherId = f.user_id1 === user.id ? f.user_id2 : f.user_id1;
          if (myFriendIds.has(otherId)) mutualCount++;
        }
      });

      return {
        id: user.id,
        username: user.name,
        displayName: user.name,
        avatar: user.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        friendshipStatus,
        mutualFriends: mutualCount
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  searchUsers
};
