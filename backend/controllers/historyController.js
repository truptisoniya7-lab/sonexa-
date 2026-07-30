const { supabase } = require('../config/db');

const addHistory = async (req, res) => {
  // Legacy support for basic insert
  return addListeningEvent(req, res);
};

const addListeningEvent = async (req, res) => {
  try {
    const { 
      user_id, 
      song_id, 
      song_title, 
      song_artist, 
      song_image, 
      song_duration,
      duration_listened = 0,
      completed = false,
      skipped = false,
      context = 'home'
    } = req.body;
    
    if (!user_id || !song_id) {
      return res.status(400).json({ error: 'user_id and song_id are required' });
    }

    let finalArtistId = null;

    // Normalize Artist
    if (song_artist) {
      const { data: artistData, error: artistErr } = await supabase
        .from('artists')
        .upsert({ name: song_artist, image_url: song_image }, { onConflict: 'name' })
        .select('id')
        .single();
        
      if (!artistErr && artistData) {
        finalArtistId = artistData.id;
      }
    }

    // Insert into user_listening_history
    const { data, error } = await supabase
      .from('user_listening_history')
      .insert([{
        user_id,
        track_id: song_id,
        track_title: song_title,
        artist_id: finalArtistId,
        played_at: new Date().toISOString(),
        duration_listened,
        total_duration: song_duration || 0,
        completed,
        skipped,
        context
      }])
      .select();

    if (error) {
      // Fallback for backwards compatibility if schema_v5 hasn't run yet
      await supabase
        .from('listening_history')
        .insert([{
          user_id,
          song_id,
          song_title,
          song_artist,
          song_image,
          song_duration,
          played_at: new Date().toISOString()
        }]);
    }

    res.json(data || { success: true });
  } catch (error) {
    console.error('Error adding listening event:', error);
    res.status(500).json({ error: 'Failed to add event' });
  }
};

const getRecentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Try V5 schema first
    const { data: v5Data, error: v5Error } = await supabase
      .from('user_listening_history')
      .select('*, artists(name, image_url)')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20);

    let dataToMap = [];

    if (!v5Error && v5Data && v5Data.length > 0) {
       dataToMap = v5Data.map(item => ({
        id: item.track_id,
        uri: item.track_id,
        title: item.track_title,
        artist: item.artists?.name || 'Unknown',
        image: item.artists?.image_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
        duration: item.total_duration,
        lastPlayed: item.played_at,
        type: 'Song',
        progress: item.duration_listened > 0 ? (item.duration_listened / item.total_duration) * 100 : 0,
        progress_ms: item.duration_listened * 1000,
        duration_ms: item.total_duration * 1000
      }));
    } else {
      // Fallback to V4 schema
      const { data, error } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(20);

      if (!error && data) {
         dataToMap = data.map(item => ({
          id: item.song_id,
          uri: item.song_id,
          title: item.song_title,
          artist: item.song_artist,
          image: item.song_image,
          duration: item.song_duration,
          lastPlayed: item.played_at,
          type: 'Song',
          progress: 0,
          progress_ms: 0,
          duration_ms: item.song_duration ? item.song_duration * 1000 : 300000
        }));
      }
    }

    res.json(dataToMap);
  } catch (error) {
    console.error('Error fetching recent history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

module.exports = {
  addHistory,
  addListeningEvent,
  getRecentHistory
};
