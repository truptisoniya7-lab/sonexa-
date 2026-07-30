export class HistoryManager {
  static async logEvent(data: any) {
    if (!data || !data.song_uri) return;
    try {
      // Basic guest sync: store in localStorage if no user_id available yet
      const userId = '1'; // Mock user id for now, should read from cookie/context
      
      await fetch('/api/history/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          song_id: data.song_uri,
          song_title: data.song_title,
          song_artist: data.song_artist,
          song_image: data.song_image,
          song_duration: data.song_duration || 0,
          duration_listened: data.duration_listened || 0,
          completed: data.completed || false,
          skipped: data.skipped || false
        })
      });
    } catch (err) {
      console.error('Failed to log history event', err);
    }
  }
}
