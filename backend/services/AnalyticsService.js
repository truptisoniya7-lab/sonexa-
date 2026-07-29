const { supabase } = require('../config/db');

class AnalyticsService {
  /**
   * Log an event asynchronously without blocking the request
   */
  static logEvent(userId, eventType, metadata = {}) {
    if (!userId) return;

    // Fire and forget
    supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        metadata
      })
      .then(({ error }) => {
        if (error) console.error('[AnalyticsService] Error logging event:', error.message);
      })
      .catch(err => {
        console.error('[AnalyticsService] Unexpected error logging event:', err.message);
      });
  }
}

module.exports = AnalyticsService;
