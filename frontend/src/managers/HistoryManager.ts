export class HistoryManager {
  private static lastSyncTime = 0;
  private static pendingSync: any = null;
  private static SYNC_INTERVAL = 15000; // 15 seconds

  static async logListen(song: any) {
    // Initial log - handled by the unified sync method with 0 progress
    this.updateProgress(song, 0, song.duration_ms ? song.duration_ms / 1000 : 0);
  }

  static async updateProgress(song: any, last_position: number, duration: number) {
    if (!song || (!song.song_uri && !song.id && !song.uri)) return;
    
    const uri = song.song_uri || song.uri || song.id;
    const progress = duration > 0 ? last_position / duration : 0;
    const completed = progress > 0.90;
    
    this.pendingSync = {
      song_id: uri,
      song_title: song.song_title || song.title,
      song_artist: song.song_artist || song.artist,
      song_image: song.song_image || song.image || song.thumbnail,
      duration: duration,
      progress: progress,
      last_position: last_position,
      completed: completed,
      room_id: null // To be populated later when rooms are active
    };

    const now = Date.now();
    if (now - this.lastSyncTime >= this.SYNC_INTERVAL || completed) {
      this.flush();
    }
  }

  static async flush() {
    if (!this.pendingSync) return;
    
    const dataToSync = { ...this.pendingSync };
    this.pendingSync = null; // Clear immediately to avoid duplicate flushes
    this.lastSyncTime = Date.now();

    try {
      const userId = '1'; // TODO: Get from auth context, or check if guest
      
      const payload = {
        user_id: userId,
        ...dataToSync
      };

      // In the future, if user is guest, write to localStorage instead
      // const isGuest = !userId;
      // if (isGuest) { this.writeToLocal(payload); return; }

      await fetch('/api/history/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true // Crucial for beforeunload
      });
    } catch (err) {
      console.error('Failed to sync history', err);
      // Restore pending on fail? (maybe too complex, dropping is fine)
    }
  }

  static setupUnloadHook() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }
}

HistoryManager.setupUnloadHook();
