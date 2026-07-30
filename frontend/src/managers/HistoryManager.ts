export class HistoryManager {
  static async logListen(song: any) {
    if (!song || !song.song_uri) return;
    try {
      const userId = '1'; // Mock user id
      
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          song_id: song.song_uri,
          song_title: song.song_title,
          song_artist: song.song_artist,
          song_image: song.song_image,
          song_duration: 0
        })
      });
    } catch (err) {
      console.error('Failed to log history event', err);
    }
  }
}
