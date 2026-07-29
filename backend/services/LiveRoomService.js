const { supabase } = require('../config/db');

class LiveRoomService {
  static async getLiveRooms(limit = 4) {
    try {
      const { data, error } = await supabase
        .from('Rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[LiveRoomService] Error getting live rooms:', error.message);
      return [];
    }
  }

  static async getFriendsActivity(limit = 10) {
    try {
      // In a real app, this would join with a friends table.
      // For now, we fetch recent activity globally or for specific mocked friends.
      const { data, error } = await supabase
        .from('friend_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[LiveRoomService] Error getting friends activity:', error.message);
      return [];
    }
  }
}

module.exports = LiveRoomService;
