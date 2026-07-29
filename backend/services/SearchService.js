const { supabase } = require('../config/db');
const ytSearch = require('yt-search');

class SearchService {
  /**
   * Unified search endpoint returning categorized results
   */
  static async performSearch(query) {
    if (!query) return { songs: [], artists: [], albums: [], playlists: [], users: [], rooms: [] };

    // Run searches in parallel
    const [songsResult, playlistsResult, usersResult, roomsResult] = await Promise.allSettled([
      this.searchSongs(query),
      this.searchPlaylists(query),
      this.searchUsers(query),
      this.searchRooms(query)
    ]);

    return {
      songs: songsResult.status === 'fulfilled' ? songsResult.value : [],
      artists: usersResult.status === 'fulfilled' ? usersResult.value : [], // Treating users as artists
      albums: [], // Hard to query accurately from YT without Spotify API
      playlists: playlistsResult.status === 'fulfilled' ? playlistsResult.value : [],
      users: usersResult.status === 'fulfilled' ? usersResult.value : [],
      rooms: roomsResult.status === 'fulfilled' ? roomsResult.value : []
    };
  }

  static async searchSongs(query) {
    try {
      const result = await ytSearch(query);
      if (!result.videos) return [];
      
      return result.videos.slice(0, 10).map(v => ({
        id: v.videoId,
        uri: v.videoId,
        title: v.title.replace(/\[.*?\]|\(.*?\)|ft\..*|feat\..*/gi, '').trim(),
        artist: v.author.name,
        image: v.thumbnail,
        duration: v.seconds
      }));
    } catch (e) {
      console.error('[SearchService] Error searching songs:', e.message);
      return [];
    }
  }

  static async searchPlaylists(query) {
    try {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .ilike('title', `%${query}%`)
        .eq('is_public', true)
        .limit(5);
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async searchUsers(query) {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, name, profile_picture')
        .ilike('name', `%${query}%`)
        .limit(5);
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async searchRooms(query) {
    try {
      const { data } = await supabase
        .from('Rooms')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(5);
      return data || [];
    } catch (e) {
      return [];
    }
  }
}

module.exports = SearchService;
