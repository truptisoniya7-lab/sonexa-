const { supabase } = require('../config/db');

class PlaybackService {
  /**
   * Save a playback session to continue listening later
   */
  static async saveSession(userId, trackId, progressMs, durationMs) {
    if (!userId || !trackId) return;

    try {
      // Upsert playback session for this track
      const { data: existing } = await supabase
        .from('playback_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .single();

      if (existing) {
        await supabase
          .from('playback_sessions')
          .update({ progress_ms: progressMs, duration_ms: durationMs, updated_at: new Date() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('playback_sessions')
          .insert({
            user_id: userId,
            track_id: trackId,
            progress_ms: progressMs,
            duration_ms: durationMs,
            updated_at: new Date()
          });
      }
    } catch (error) {
      console.error('[PlaybackService] Error saving session:', error.message);
    }
  }

  /**
   * Get the most recent playback session for 'Continue Listening'
   */
  static async getMostRecentSession(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('playback_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('[PlaybackService] Error getting recent session:', error.message);
      return null;
    }
  }

  /**
   * Persist the user's current queue
   */
  static async saveQueue(userId, trackIds, currentIndex) {
    if (!userId) return;
    try {
      await supabase
        .from('playback_queue')
        .upsert({
          user_id: userId,
          track_ids: trackIds,
          current_index: currentIndex,
          updated_at: new Date()
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('[PlaybackService] Error saving queue:', error.message);
    }
  }

  /**
   * Get the user's persisted queue
   */
  static async getQueue(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('playback_queue')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('[PlaybackService] Error getting queue:', error.message);
      return null;
    }
  }
}

module.exports = PlaybackService;
