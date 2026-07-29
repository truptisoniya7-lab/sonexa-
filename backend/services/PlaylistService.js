const { supabase } = require('../config/db');

class PlaylistService {
  static async getUserPlaylists(userId, limit = 5) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[PlaylistService] Error getting playlists:', error.message);
      return [];
    }
  }

  static async getTrendingPlaylists(limit = 4) {
    try {
      // In a real app, query based on play counts
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[PlaylistService] Error getting trending playlists:', error.message);
      return [];
    }
  }
}

module.exports = PlaylistService;
