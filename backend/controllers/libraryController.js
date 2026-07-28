const mockDB = require('../mock/libraryData');

const USE_MOCKS = true;

const formatRelativeTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  
  const isYesterday = now.getDate() - date.getDate() === 1 && now.getMonth() === date.getMonth();
  if (isYesterday) return 'Yesterday';
  
  if (diffInSeconds < 86400 * 7) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return 'Last week';
};

const formatTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Shuffle array helper
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const getLibraryData = async (req, res) => {
  try {
    if (!USE_MOCKS) {
      return res.status(501).json({ error: 'Database implementation coming soon' });
    }

    // 1. Resolve relations
    const trackMap = mockDB.tracks.reduce((acc, t) => ({ ...acc, [t.track_id]: t }), {});
    const albumMap = mockDB.albums.reduce((acc, a) => ({ ...acc, [a.album_id]: a }), {});
    const playlistMap = mockDB.playlists.reduce((acc, p) => ({ ...acc, [p.playlist_id]: p }), {});

    // 2. Build Playlists with Collages
    const playlists = mockDB.playlists.map(p => {
      const pTracks = p.tracks.map(tid => trackMap[tid]).filter(Boolean);
      const images = pTracks.map(t => t.image).slice(0, 4); // Up to 4 images for collage
      // fallback to single image if fewer than 4 tracks
      const coverImage = images.length === 4 ? images : (images[0] || 'https://via.placeholder.com/300?text=Empty');
      
      return {
        id: p.playlist_id,
        type: 'Playlist',
        title: p.title,
        creator: p.creator,
        count: `${p.tracks.length} Songs`,
        updated: `Updated ${formatRelativeTime(p.updated_at)}`,
        duration: '2h 10m', // Simplified for demo
        image: coverImage,
        isCollage: Array.isArray(coverImage) && coverImage.length === 4
      };
    });

    // 3. Pinned Items
    const pinned = mockDB.pinned_items.map(id => {
      if (trackMap[id]) return { id, type: 'Song', title: trackMap[id].title, image: trackMap[id].image, count: trackMap[id].artist, icon: 'music' };
      if (playlistMap[id]) return playlists.find(p => p.id === id);
      if (albumMap[id]) return { id, type: 'Album', title: albumMap[id].title, image: albumMap[id].image, count: albumMap[id].year, icon: 'disc' };
      return null;
    }).filter(Boolean);

    // 4. Recently Played
    const recent = mockDB.recently_played.map(r => {
      const t = trackMap[r.track_id];
      if (!t) return null;
      return {
        id: r.id,
        type: 'Song',
        title: t.title,
        artist: t.artist,
        image: t.image,
        lastPlayed: formatRelativeTime(r.played_at),
        progress_ms: r.progress_ms,
        duration_ms: t.duration_ms,
        progress: (r.progress_ms / t.duration_ms) * 100
      };
    }).filter(Boolean);

    // Continue Listening = First unfinished track in recent
    const continueListening = recent.find(r => r.progress_ms > 0 && r.progress_ms < r.duration_ms) || null;

    // 5. Activity Timeline
    const activity = mockDB.activity_timeline.map(act => {
      let detail = '';
      if (act.track_id) detail = trackMap[act.track_id]?.title || '';
      if (act.playlist_id) detail = playlistMap[act.playlist_id]?.title || '';
      
      const actionMap = {
        'liked_track': 'Liked',
        'added_to_playlist': 'Added to playlist',
        'played_track': 'Played',
        'created_playlist': 'Created playlist'
      };

      return {
        id: act.id,
        date: formatRelativeTime(act.created_at),
        action: actionMap[act.type] || act.type,
        detail,
        type: act.icon
      };
    });

    // 6. Friends Activity
    const friends_activity = mockDB.friends_activity.map(fa => {
      let detail = fa.playlist_name || '';
      if (fa.track_id && trackMap[fa.track_id]) {
        detail = trackMap[fa.track_id].title;
      }
      return {
        id: fa.id,
        user: fa.user_name,
        action: fa.action,
        detail,
        time: formatRelativeTime(fa.timestamp)
      };
    });

    // 7. Deterministic Recommendations based on Favorite Genres
    const favGenres = mockDB.user_preferences.favorite_genres;
    const recommendations = favGenres.map((genre, index) => {
      const matchingTracks = mockDB.tracks.filter(t => t.genre === genre);
      if (matchingTracks.length === 0) return null;
      
      return {
        id: `rec_${index}`,
        reason: `Because you like ${genre}`,
        title: `${genre} Mix`,
        image: matchingTracks[0].image,
        subItems: shuffle(matchingTracks).slice(0, 3).map(t => ({
          title: t.title,
          image: t.image
        }))
      };
    }).filter(Boolean);

    // Formatting Artists
    const artists = mockDB.artists.map(a => ({
      id: a.artist_id,
      title: a.name,
      plays: `${a.plays} plays`,
      status: a.status,
      image: a.image
    }));

    // Randomize sections for "fresh" feel
    res.json({
      greeting: formatTimeOfDay(),
      greetingSubtitle: `Played ${Math.floor(Math.random() * 20 + 5)} songs this week.`,
      summary: mockDB.summary,
      pinned,
      recent: shuffle(recent), // Shuffle for refresh variation
      continueListening,
      playlists: shuffle(playlists),
      albums: mockDB.albums,
      artists: shuffle(artists),
      activity,
      friendsActivity: shuffle(friends_activity),
      recommendations,
      insights: mockDB.insights
    });

  } catch (error) {
    console.error('Error fetching library data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getLibraryData
};
