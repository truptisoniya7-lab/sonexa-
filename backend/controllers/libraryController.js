const { supabase } = require('../config/db');

const formatTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getLibraryData = async (req, res) => {
  try {
    // We assume user_id 1 for now if no auth is provided
    const userId = 1;

    // 1. Fetch Recently Played
    const { data: historyData, error: historyError } = await supabase
      .from('listening_history')
      .select('*')
      // If userId was UUID, we'd filter, but since it might not be set up, we just get recent
      .order('played_at', { ascending: false })
      .limit(30);

    const recent = (historyData || []).map(item => ({
      id: item.song_id + Math.random(),
      type: 'Song',
      title: item.song_title,
      artist: item.song_artist,
      image: item.song_image,
      lastPlayed: item.played_at,
      progress_ms: 0,
      duration_ms: item.song_duration ? item.song_duration * 1000 : 200000,
      progress: 0
    }));

    // Deduplicate recent for artists list
    const uniqueArtists = new Map();
    (historyData || []).forEach(item => {
      if (!uniqueArtists.has(item.song_artist)) {
        uniqueArtists.set(item.song_artist, {
          id: `artist-${item.song_artist}`,
          title: item.song_artist,
          image: item.song_image,
          plays: '1 plays',
          status: 'Artist'
        });
      }
    });
    const artists = Array.from(uniqueArtists.values());

    const continueListening = recent[0] || null;

    // 2. Fetch Playlists (assuming a playlists table exists, catch if not)
    let playlists = [];
    try {
      const { data: pData } = await supabase.from('playlists').select('*').limit(10);
      if (pData) {
        playlists = pData.map(p => ({
          id: p.id,
          type: 'Playlist',
          title: p.name || p.title,
          image: p.image || 'https://via.placeholder.com/300',
          count: '0 Songs'
        }));
      }
    } catch (e) {
      // ignore
    }

    // 3. Activity
    const activity = (historyData || []).slice(0, 5).map(item => ({
      id: item.song_id + Math.random(),
      date: item.played_at,
      action: 'Played',
      detail: item.song_title,
      type: 'music'
    }));

    // 4. Personalized Recommendations
    let recommendations = [];
    if (artists.length > 0) {
      // Pick top artist
      const topArtist = artists[0].title;
      // Fetch 4 tracks from listening history related to this artist, or just create a mock recommendation for now that is generated based on this artist
      const subItems = historyData.filter(h => h.song_artist === topArtist).slice(0, 3).map(h => ({
        title: h.song_title,
        image: h.song_image
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
      summary: { likedSongs: 0, playlists: playlists.length, downloaded: 0, followingArtists: artists.length },
      pinned: playlists.slice(0, 4),
      recent,
      continueListening,
      playlists,
      albums: [],
      artists,
      activity,
      friendsActivity: [],
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
