export class LyricsManager {
  static async getLyrics(songTitle: string, artistName: string) {
    // In a full implementation, this hits /api/lyrics
    return `[Lyrics for ${songTitle} by ${artistName} not available]`;
  }
}
