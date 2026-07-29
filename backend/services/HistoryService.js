const { supabase } = require('../config/db');

class HistoryService {
  /**
   * Log a completed listen to history
   */
  static async addHistory(userId, track) {
    if (!userId || !track) return;
    try {
      await supabase
        .from('listening_history')
        .insert({
          user_id: userId,
          song_id: track.id,
          song_title: track.title,
          song_artist: track.artist,
          song_image: track.image,
          song_duration: track.duration_ms || 0
        });

      // Also log to friend activity
      await supabase
        .from('friend_activity')
        .insert({
          user_id: userId,
          track_id: track.id,
          type: 'listening'
        });
    } catch (error) {
      console.error('[HistoryService] Error adding history:', error.message);
    }
  }

  /**
   * Get recently played tracks for a user
   */
  static async getRecentlyPlayed(userId, limit = 10) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Deduplicate by song_id
      const unique = [];
      const seen = new Set();
      for (const item of data) {
        if (!seen.has(item.song_id)) {
          seen.add(item.song_id);
          unique.push(item);
        }
      }
      return unique;
    } catch (error) {
      console.error('[HistoryService] Error getting recently played:', error.message);
      return [];
    }
  }
}

module.exports = HistoryService;
