const { supabase } = require('../config/db');

const addHistory = async (req, res) => {
  try {
    const { user_id, song_id, song_title, song_artist, song_image, song_duration } = req.body;
    
    if (!user_id || !song_id) {
      return res.status(400).json({ error: 'user_id and song_id are required' });
    }

    // Insert into listening history
    const { data, error } = await supabase
      .from('listening_history')
      .insert([{
        user_id,
        song_id,
        song_title,
        song_artist,
        song_image,
        song_duration,
        played_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error adding history:', error);
    res.status(500).json({ error: 'Failed to add history' });
  }
};

const getRecentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data, error } = await supabase
      .from('listening_history')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    // Map to frontend expected format
    const formatted = data.map(item => ({
      id: item.song_id,
      uri: item.song_id,
      title: item.song_title,
      artist: item.song_artist,
      image: item.song_image,
      duration: item.song_duration,
      lastPlayed: item.played_at,
      type: 'Song',
      progress: Math.floor(Math.random() * 100), // Mock progress for now
      progress_ms: 10000,
      duration_ms: item.song_duration ? item.song_duration * 1000 : 300000
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching recent history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

module.exports = {
  addHistory,
  getRecentHistory
};
