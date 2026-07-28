const { supabase } = require('../config/db');

const addHistory = async (req, res) => {
  const { userId, song } = req.body;
  if (!userId || !song || !song.id) {
    return res.status(400).json({ error: 'Missing userId or song data' });
  }

  try {
    const { error } = await supabase
      .from('listening_history')
      .insert([{
        user_id: userId,
        song_id: song.id,
        song_title: song.title || song.song_title || 'Unknown',
        song_artist: song.artist || song.song_artist || 'Unknown',
        song_image: song.image || song.song_image || '',
        song_duration: Math.round(Number(song.duration)) || 0,
        played_at: new Date().toISOString()
      }]);

    if (error) {
      // If table doesn't exist, we just ignore to not break the app
      if (error.code === 'PGRST205') {
        return res.status(200).json({ success: true, warning: 'Table listening_history not found' });
      }
      throw error;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRecent = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.json([]);
  }

  try {
    const { data, error } = await supabase
      .from('listening_history')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20);

    if (error) {
      if (error.code === 'PGRST205') {
        return res.json([]);
      }
      throw error;
    }

    // Deduplicate songs by ID to avoid showing the same song 5 times in a row
    const uniqueSongs = [];
    const seenIds = new Set();
    
    for (const item of data) {
      if (!seenIds.has(item.song_id)) {
        seenIds.add(item.song_id);
        uniqueSongs.push({
          id: item.song_id,
          uri: item.song_id,
          title: item.song_title,
          artist: item.song_artist,
          image: item.song_image,
          duration: item.song_duration,
          played_at: item.played_at
        });
      }
    }

    res.json(uniqueSongs);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addHistory,
  getRecent
};
