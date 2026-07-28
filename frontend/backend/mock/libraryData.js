module.exports = {
  user_preferences: {
    favorite_genres: ['Pop', 'Lofi', 'Bollywood']
  },
  tracks: [
    { track_id: 'track_001', title: 'Espresso', artist: 'Sabrina Carpenter', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 198000, genre: 'Pop' },
    { track_id: 'track_002', title: 'Midnight Rain', artist: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 238000, genre: 'Pop' },
    { track_id: 'track_003', title: 'Night Drive', artist: 'Lofi Chill', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a4411138?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 180000, genre: 'Lofi' },
    { track_id: 'track_004', title: 'Coding Focus', artist: 'Study Beats', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 360000, genre: 'Lofi' },
    { track_id: 'track_005', title: 'Chaleya', artist: 'Arijit Singh', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 210000, genre: 'Bollywood' },
    { track_id: 'track_006', title: 'Blinding Lights', artist: 'The Weeknd', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 200000, genre: 'Pop' },
    { track_id: 'track_007', title: 'Levitating', artist: 'Dua Lipa', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 203000, genre: 'Pop' },
    { track_id: 'track_008', title: 'Tum Hi Ho', artist: 'Arijit Singh', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300', duration_ms: 250000, genre: 'Bollywood' },
  ],
  playlists: [
    { playlist_id: 'playlist_001', title: 'Workout Mix', creator: 'You', updated_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 1000000000).toISOString(), tracks: ['track_001', 'track_002', 'track_005', 'track_006', 'track_007'] },
    { playlist_id: 'playlist_002', title: 'Chill Vibes', creator: 'Sonexa', updated_at: new Date(Date.now() - 172800000).toISOString(), created_at: new Date(Date.now() - 2000000000).toISOString(), tracks: ['track_003', 'track_004'] },
    { playlist_id: 'playlist_003', title: 'Late Night', creator: 'You', updated_at: new Date().toISOString(), created_at: new Date().toISOString(), tracks: ['track_002', 'track_003'] },
    { playlist_id: 'playlist_004', title: 'Empty List', creator: 'System', updated_at: new Date().toISOString(), created_at: new Date().toISOString(), tracks: [] },
  ],
  albums: [
    { album_id: 'album_001', title: "After Hours", artist: "The Weeknd", year: "2020", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300" },
    { album_id: 'album_002', title: "Random Access Memories", artist: "Daft Punk", year: "2013", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300" },
  ],
  artists: [
    { artist_id: 'artist_001', name: "The Weeknd", followers: 85000000, plays: 2400, status: "Recently Played", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300" },
    { artist_id: 'artist_002', name: "Dua Lipa", followers: 70000000, plays: 1200, status: "New Album Available", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300" },
    { artist_id: 'artist_003', name: "Taylor Swift", followers: 110000000, plays: 3100, status: "Following", image: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=300&h=300" },
    { artist_id: 'artist_004', name: "Arijit Singh", followers: 50000000, plays: 950, status: "Recently Played", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300" },
  ],
  recently_played: [
    { id: 'recent_001', track_id: 'track_001', played_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), progress_ms: 102000 },
    { id: 'recent_002', track_id: 'track_002', played_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), progress_ms: 238000 }, // Finished
    { id: 'recent_003', track_id: 'track_003', played_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), progress_ms: 45000 },
  ],
  activity_timeline: [
    { id: 'act_001', type: 'liked_track', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), track_id: 'track_001', icon: 'heart' },
    { id: 'act_002', type: 'added_to_playlist', created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), track_id: 'track_005', playlist_id: 'playlist_001', icon: 'plus' },
    { id: 'act_003', type: 'played_track', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), track_id: 'track_002', icon: 'music' },
    { id: 'act_004', type: 'created_playlist', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), playlist_id: 'playlist_002', icon: 'list' },
  ],
  friends_activity: [
    { id: 'fa_001', user_name: 'Rahul', action: 'listened to', track_id: 'track_006', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 'fa_002', user_name: 'Aisha', action: 'liked', track_id: 'track_001', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 'fa_003', user_name: 'Aryan', action: 'created', playlist_name: 'Gym Hits', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ],
  pinned_items: ['playlist_001', 'playlist_003', 'track_002', 'album_001']
};
