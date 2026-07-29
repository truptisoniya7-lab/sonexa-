const { supabase } = require('../config/db');
const ytSearch = require('yt-search'); // Used for fetching dynamic tracks based on artist/genre

class RecommendationService {
  /**
   * Main recommendation pipeline
   */
  static async getMadeForYou(userId) {
    if (!userId) return [];

    try {
      // 1. Check persistent cache
      const { data: cacheData } = await supabase
        .from('recommendation_cache')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (cacheData && new Date(cacheData.expires_at) > new Date()) {
        return cacheData.recommendations;
      }

      // Cache expired or missing. Generate new recommendations asynchronously
      // and return stale/fallback for now to keep the request fast.
      this.generateAndCacheRecommendations(userId);

      return cacheData ? cacheData.recommendations : await this.getFallbackRecommendations();
    } catch (error) {
      console.error('[RecommendationService] Error in getMadeForYou:', error.message);
      return [];
    }
  }

  /**
   * Asynchronously generates and caches recommendations
   */
  static async generateAndCacheRecommendations(userId) {
    try {
      // Pipeline Step 1: Fetch History
      const { data: history } = await supabase
        .from('listening_history')
        .select('song_artist')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(20);

      // Pipeline Step 2: Extract Favourite Artists
      const artistCounts = {};
      if (history) {
        history.forEach(h => {
          artistCounts[h.song_artist] = (artistCounts[h.song_artist] || 0) + 1;
        });
      }
      const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);
      const topArtist = sortedArtists.length > 0 ? sortedArtists[0][0] : 'Ed Sheeran';

      // Pipeline Step 3: Fetch dynamic tracks based on Top Artist via ytSearch
      const searchResult = await ytSearch(topArtist + ' songs');
      const tracks = searchResult.videos.slice(0, 5).map(v => ({
        id: `rec-${v.videoId}`,
        uri: v.videoId,
        title: v.title.replace(/\[.*?\]|\(.*?\)|ft\..*|feat\..*|official video/gi, '').trim(),
        artist: v.author.name,
        image: v.thumbnail,
        reason: `Because you listen to ${topArtist}`
      }));

      // Pipeline Step 4 & 5 (Genres, Liked, Trending) - omitted for brevity in this simple version
      
      // Pipeline Step 6: Filter Duplicates & Rank
      // ... 
      
      const recommendations = tracks.length > 0 ? tracks : await this.getFallbackRecommendations();

      // Pipeline Step 7: Cache in Supabase
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 45); // 45 min cache

      await supabase
        .from('recommendation_cache')
        .upsert({
          user_id: userId,
          recommendations,
          generated_at: new Date(),
          expires_at: expiresAt
        }, { onConflict: 'user_id' });

    } catch (error) {
      console.error('[RecommendationService] Error generating recommendations:', error.message);
    }
  }

  static async getFallbackRecommendations() {
    return [
      {
        id: 'fallback-1',
        title: 'Top Hits',
        artist: 'Various Artists',
        image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200',
        reason: 'Trending Now'
      }
    ];
  }
}

module.exports = RecommendationService;
