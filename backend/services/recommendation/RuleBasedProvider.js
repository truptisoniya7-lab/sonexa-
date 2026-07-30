const RecommendationProvider = require('./RecommendationProvider');
const { supabase } = require('../../config/db');
const ytSearch = require('yt-search');

class RuleBasedProvider extends RecommendationProvider {
  
  async getHomeRecommendations(userId) {
    if (!userId || userId === 'guest') {
      return this.getGuestLayout();
    }

    try {
      // 1. Check Cache
      const { data: cacheData } = await supabase
        .from('user_home_layout_cache')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (cacheData && new Date(cacheData.expires_at) > new Date()) {
        return cacheData.layout_data;
      }

      // Cache Miss / Expired -> Generate Pipeline
      const profile = await this.calculateUserTasteProfile(userId);
      const layout = await this.generatePipeline(userId, profile);

      // Save to Cache (Async)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache
      
      supabase.from('user_home_layout_cache').upsert({
        user_id: userId,
        layout_data: layout,
        expires_at: expiresAt,
        generated_at: new Date()
      }).then();

      return layout;
    } catch (e) {
      console.error('[RuleBasedProvider] Error:', e);
      return this.getGuestLayout();
    }
  }

  async getGuestLayout() {
    return [
      {
        id: 'hero',
        type: 'HERO',
        endpoint: null
      },
      {
        id: 'trending-global',
        type: 'COVER_FLOW',
        title: 'Trending Globally',
        endpoint: '/api/music/discover?category=trending'
      },
      {
        id: 'new-releases',
        type: 'CAROUSEL',
        title: 'New Releases',
        endpoint: '/api/music/discover?category=new'
      }
    ];
  }

  async calculateUserTasteProfile(userId) {
    const { data: history } = await supabase
      .from('user_listening_history')
      .select('track_title, artist_id, artists(name), genre_id, genres(name), completed, skipped, duration_listened')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(100);

    if (!history || history.length === 0) return null;

    const artistScores = {};
    const genreScores = {};
    let totalDuration = 0;

    history.forEach(h => {
      const artistName = h.artists?.name;
      const genreName = h.genres?.name;
      
      // Scoring Algorithm
      // Base +1 for play. +2 for completion. -2 for skip.
      const score = (h.completed ? 3 : (h.skipped ? -1 : 1));

      if (artistName) {
        artistScores[artistName] = (artistScores[artistName] || 0) + score;
      }
      if (genreName) {
        genreScores[genreName] = (genreScores[genreName] || 0) + score;
      }
      
      totalDuration += (h.duration_listened || 0);
    });

    const topArtists = Object.entries(artistScores).sort((a,b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    const topGenres = Object.entries(genreScores).sort((a,b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    return {
      topArtists,
      topGenres,
      avgSession: history.length > 0 ? (totalDuration / history.length) : 0,
      isColdStart: history.length < 10
    };
  }

  async generatePipeline(userId, profile) {
    if (!profile || profile.isColdStart) {
      return this.getGuestLayout();
    }

    const layout = [
      {
        id: 'hero',
        type: 'HERO',
        endpoint: null
      }
    ];

    // Recently Played
    layout.push({
      id: 'recently-played',
      type: 'INFINITE_CAROUSEL',
      title: 'Jump Back In',
      endpoint: '/api/music/discover?category=recent' // Assuming recent endpoint exists
    });

    // Artist Based Recommendation
    if (profile.topArtists.length > 0) {
      const topArtist = profile.topArtists[0];
      layout.push({
        id: `artist-${topArtist.toLowerCase().replace(/\\s+/g, '-')}`,
        type: 'CAROUSEL',
        title: `Because You Listened To ${topArtist}`,
        endpoint: `/api/music/discover?section=${encodeURIComponent(topArtist)}`
      });
    }

    // Recommended Rooms
    layout.push({
      id: 'recommended-rooms',
      type: 'CAROUSEL',
      title: 'Rooms You Might Like',
      endpoint: '/api/rooms/recommended' // New endpoint to build
    });

    // Genre Based
    if (profile.topGenres.length > 0) {
      const topGenre = profile.topGenres[0];
      layout.push({
        id: `genre-${topGenre.toLowerCase()}`,
        type: 'MASONRY',
        title: `Trending in ${topGenre}`,
        endpoint: `/api/music/discover?genre=${encodeURIComponent(topGenre)}`
      });
    }

    return layout;
  }
}

module.exports = RuleBasedProvider;
