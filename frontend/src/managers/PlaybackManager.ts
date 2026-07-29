export class PlaybackManager {
  static async saveProgress(songId: string, progressMs: number, durationMs: number) {
    if (!songId || durationMs <= 0) return;
    
    // Only save if progress is at least 10 seconds to avoid spam
    if (progressMs < 10000) return;

    try {
      // In a full implementation, this hits /api/playback
      // For now, we mock the network request
      // fetch('/api/playback', { method: 'POST', body: JSON.stringify({ songId, progressMs, durationMs }) })
    } catch (e) {
      console.error('Failed to save playback progress', e);
    }
  }
}
