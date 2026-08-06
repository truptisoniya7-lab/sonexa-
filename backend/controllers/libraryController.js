const { supabase } = require('../config/db');

const formatTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getLibraryData = async (req, res) => {
  try {
    const userId = req.cookies?.user_id || req.headers['x-user-id'] || '1';

    // 1. Fetch History from the new Centralized Play History
    const { data: historyData, error: historyError } = await supabase
      .from('play_history')
      .select('*, tracks(*)')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(50);

    const recent = (historyData || []).map(item => ({
      id: item.id,
      uri: item.tracks?.youtube_video_id,
      type: 'Song',
      title: item.tracks?.title,
      artist: item.tracks?.artist,
      image: item.tracks?.thumbnail,
      lastPlayed: item.played_at,
      progress_ms: item.last_position * 1000,
      duration_ms: item.tracks?.duration_ms || 200000,
      progress: item.progress * 100,
      completed: item.completed
    }));

    // Deduplicate recent for artists list
    const uniqueArtists = new Map();
    (historyData || []).forEach(item => {
      const track = item.tracks;
      if (track && !uniqueArtists.has(track.artist)) {
        uniqueArtists.set(track.artist, {
          id: `artist-${track.artist}`,
          title: track.artist,
          image: track.thumbnail,
          plays: '1 plays',
          status: 'Artist'
        });
      }
    });
    const artists = Array.from(uniqueArtists.values());

    const continueListening = recent.find(item => item.progress > 10 && !item.completed) || null;

    // Timeline Grouping for History Tab
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 7 * 86400000;
    const last30Days = today - 30 * 86400000;

    const historyGrouped = {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      older: []
    };

    let totalSecondsListened = 0;
    let completedCount = 0;

    recent.forEach(item => {
      const time = new Date(item.lastPlayed).getTime();
      totalSecondsListened += (item.progress_ms / 1000) || 0;
      if (item.completed) completedCount++;

      if (time >= today) historyGrouped.today.push(item);
      else if (time >= yesterday) historyGrouped.yesterday.push(item);
      else if (time >= last7Days) historyGrouped.last7Days.push(item);
      else if (time >= last30Days) historyGrouped.last30Days.push(item);
      else historyGrouped.older.push(item);
    });

    const stats = {
      hoursListened: (totalSecondsListened / 3600).toFixed(1),
      totalSongs: recent.length,
      completionRate: recent.length > 0 ? Math.round((completedCount / recent.length) * 100) : 0
    };

    // 2. Fetch Playlists
    let playlists = [];
    try {
      const { data: pData } = await supabase.from('playlists').select('*').limit(10);
      if (pData) {
        playlists = pData.map(p => ({
          id: p.id,
          type: 'Playlist',
          title: p.name || p.title,
          image: p.cover_image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80',
          count: '0 Songs'
        }));
      }
    } catch (e) {
      // ignore
    }

    // 3. Personalized Recommendations
    let recommendations = [];
    if (artists.length > 0) {
      const topArtist = artists[0].title;
      const subItems = historyData
        .filter(h => h.tracks?.artist === topArtist)
        .slice(0, 3)
        .map(h => ({
          title: h.tracks?.title,
          image: h.tracks?.thumbnail
        }));
      
      recommendations.push({
        id: `rec_1`,
        reason: `Because you like ${topArtist}`,
        title: `${topArtist} Mix`,
        image: artists[0].image,
        subItems: subItems.length > 0 ? subItems : undefined
      });
    }

    res.json({
      greeting: formatTimeOfDay(),
      greetingSubtitle: `Played ${recent.length} songs recently.`,
      pinned: [],
      recent,
      historyGrouped,
      stats,
      continueListening,
      playlists,
      albums: [],
      artists,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching library data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getLibraryData
};
