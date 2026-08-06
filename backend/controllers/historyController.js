const { supabase } = require('../config/db');

// Upsert listening progress (sync endpoint)
const syncProgress = async (req, res) => {
  try {
    const { 
      user_id, 
      song_id, 
      song_title, 
      song_artist, 
      song_image, 
      duration = 0,
      progress = 0,
      last_position = 0,
      completed = false,
      room_id = null
    } = req.body;
    
    if (!user_id || !song_id) {
      return res.status(400).json({ error: 'user_id and song_id are required' });
    }

    // Ignore short accidental plays (less than 15 seconds AND less than 20%)
    const durationSec = duration || (last_position > 0 ? last_position / progress : 1);
    const progressPct = progress || (durationSec > 0 ? last_position / durationSec : 0);
    
    if (last_position < 15 && progressPct < 0.20 && !completed) {
      return res.json({ success: true, ignored: true, reason: 'too short' });
    }

    // 1. Ensure track exists in catalog
    const { data: trackData, error: trackError } = await supabase
      .from('tracks')
      .upsert({ 
        youtube_video_id: song_id, 
        title: song_title || 'Unknown Title', 
        artist: song_artist || 'Unknown Artist', 
        thumbnail: song_image, 
        duration_ms: duration ? duration * 1000 : 0 
      }, { onConflict: 'youtube_video_id' })
      .select('id')
      .single();

    if (trackError || !trackData) {
      console.error('Error upserting track:', trackError);
      return res.status(500).json({ error: 'Failed to process track metadata' });
    }

    const internalTrackId = trackData.id;

    // 2. Check for an existing session within the last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: recentSessions, error: recentError } = await supabase
      .from('play_history')
      .select('*')
      .eq('user_id', user_id)
      .eq('song_id', internalTrackId)
      .gte('played_at', thirtyMinsAgo)
      .order('played_at', { ascending: false })
      .limit(1);

    if (recentSessions && recentSessions.length > 0) {
      // Update existing session
      const session = recentSessions[0];
      
      // Only mark completed if it transitions to completed, or stays completed
      const isNowCompleted = session.completed || completed || progressPct > 0.90;
      
      const { data, error } = await supabase
        .from('play_history')
        .update({
          progress: progressPct,
          last_position: last_position,
          completed: isNowCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)
        .select();

      return res.json({ success: true, action: 'updated', data });
    } else {
      // Create new session
      const isNowCompleted = completed || progressPct > 0.90;
      const { data, error } = await supabase
        .from('play_history')
        .insert([{
          user_id,
          song_id: internalTrackId,
          progress: progressPct,
          last_position: last_position,
          completed: isNowCompleted,
          play_count: 1,
          played_at: new Date().toISOString(),
          room_id: room_id
        }])
        .select();

      return res.json({ success: true, action: 'inserted', data });
    }
  } catch (error) {
    console.error('Error syncing progress:', error);
    res.status(500).json({ error: 'Failed to sync progress' });
  }
};

// Merge guest local storage on login
const mergeHistory = async (req, res) => {
  try {
    const { user_id, local_history } = req.body;
    if (!user_id || !local_history || !Array.isArray(local_history)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Naive merge for now - insert everything that is > 15s. 
    // In a real prod environment we'd do a smart batch UPSERT.
    let mergedCount = 0;
    
    for (const item of local_history) {
       if (item.last_position >= 15 || item.progress >= 0.20 || item.completed) {
         // Create track
         const { data: trackData } = await supabase
          .from('tracks')
          .upsert({ 
            youtube_video_id: item.song_id, 
            title: item.song_title || 'Unknown Title', 
            artist: item.song_artist || 'Unknown Artist', 
            thumbnail: item.song_image, 
            duration_ms: item.duration ? item.duration * 1000 : 0 
          }, { onConflict: 'youtube_video_id' })
          .select('id')
          .single();
          
         if (trackData) {
            // Check 30 min window based on item.played_at
            const itemTime = new Date(item.played_at).getTime();
            const thirtyMinsBefore = new Date(itemTime - 30 * 60 * 1000).toISOString();
            const thirtyMinsAfter = new Date(itemTime + 30 * 60 * 1000).toISOString();
            
            const { data: existing } = await supabase
              .from('play_history')
              .select('id, progress, last_position, completed')
              .eq('user_id', user_id)
              .eq('song_id', trackData.id)
              .gte('played_at', thirtyMinsBefore)
              .lte('played_at', thirtyMinsAfter)
              .limit(1);
              
            if (existing && existing.length > 0) {
               // Merge - take highest progress
               const ex = existing[0];
               if (item.last_position > ex.last_position) {
                 await supabase.from('play_history').update({
                   progress: item.progress,
                   last_position: item.last_position,
                   completed: ex.completed || item.completed,
                   updated_at: new Date().toISOString()
                 }).eq('id', ex.id);
               }
            } else {
               // Insert
               await supabase.from('play_history').insert([{
                  user_id,
                  song_id: trackData.id,
                  progress: item.progress,
                  last_position: item.last_position,
                  completed: item.completed,
                  played_at: item.played_at,
                  play_count: 1
               }]);
            }
            mergedCount++;
         }
       }
    }
    
    res.json({ success: true, merged: mergedCount });
  } catch (error) {
    console.error('Error merging history:', error);
    res.status(500).json({ error: 'Failed to merge history' });
  }
};

const getRecentHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.cookies?.user_id || req.headers['x-user-id'] || '1';
    
    const { data, error } = await supabase
      .from('play_history')
      .select('*, tracks(*)')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Format for frontend
    const history = (data || []).map(item => ({
      id: item.id, // The history record ID
      uri: item.tracks?.youtube_video_id,
      title: item.tracks?.title,
      artist: item.tracks?.artist,
      image: item.tracks?.thumbnail,
      duration: item.tracks?.duration_ms ? item.tracks.duration_ms / 1000 : 0,
      duration_ms: item.tracks?.duration_ms,
      progress: item.progress * 100, // percentage
      progress_ms: item.last_position * 1000,
      last_position: item.last_position,
      completed: item.completed,
      played_at: item.played_at,
      type: 'Song'
    }));

    // Grouping
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 7 * 86400000;
    const last30Days = today - 30 * 86400000;

    const grouped = {
      continueListening: [],
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      older: []
    };

    // Track unique URIs to avoid duplicates in continue listening
    const continueSet = new Set();

    history.forEach(item => {
      const time = new Date(item.played_at).getTime();
      
      // Continue Listening filter: progress > 10% and not completed
      if (item.progress > 10 && !item.completed && !continueSet.has(item.uri)) {
        grouped.continueListening.push(item);
        continueSet.add(item.uri);
      }

      if (time >= today) {
        grouped.today.push(item);
      } else if (time >= yesterday) {
        grouped.yesterday.push(item);
      } else if (time >= last7Days) {
        grouped.last7Days.push(item);
      } else if (time >= last30Days) {
        grouped.last30Days.push(item);
      } else {
        grouped.older.push(item);
      }
    });

    if (req.query.filter === 'continue') {
      return res.json(grouped.continueListening);
    }

    res.json({
      success: true,
      raw: history,
      grouped
    });
  } catch (error) {
    console.error('Error fetching recent history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.cookies?.user_id || req.headers['x-user-id'] || '1';
    
    // In a real app we would use SQL aggregations. For simplicity, we'll fetch up to 1000 and calculate in memory.
    const { data, error } = await supabase
      .from('play_history')
      .select('*, tracks(*)')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    let totalPlays = 0;
    let totalSecondsListened = 0;
    let completedSongs = 0;
    const artistsCount = {};
    const songsCount = {};
    let longestSession = 0;

    (data || []).forEach(item => {
      totalPlays += item.play_count;
      totalSecondsListened += item.last_position;
      if (item.completed) completedSongs++;
      
      if (item.last_position > longestSession) {
        longestSession = item.last_position;
      }

      if (item.tracks) {
        artistsCount[item.tracks.artist] = (artistsCount[item.tracks.artist] || 0) + 1;
        songsCount[item.tracks.title] = (songsCount[item.tracks.title] || 0) + 1;
      }
    });

    const favoriteArtist = Object.entries(artistsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    const mostPlayedSong = Object.entries(songsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    
    const stats = {
      totalPlays,
      hoursListened: (totalSecondsListened / 3600).toFixed(1),
      favoriteArtist,
      favoriteGenre: 'Pop', // Mock for now unless we enrich genre
      mostPlayedSong,
      completionRate: totalPlays > 0 ? Math.round((completedSongs / totalPlays) * 100) : 0,
      longestSessionMinutes: Math.round(longestSession / 60)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Export the updated functions
module.exports = {
  syncProgress,
  mergeHistory,
  getRecentHistory,
  getStats,
  // backwards compatibility
  addHistory: syncProgress, 
  addListeningEvent: syncProgress
};
