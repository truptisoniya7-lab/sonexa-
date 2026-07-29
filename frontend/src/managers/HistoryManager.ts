export class HistoryManager {
  static async logListen(song: any) {
    if (!song) return;
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: '1', 
          song_id: song.song_uri,
          song_title: song.song_title,
          song_artist: song.song_artist,
          song_image: song.song_image
        })
      });
    } catch (err) {
      console.error('Failed to log history', err);
    }
  }
}
