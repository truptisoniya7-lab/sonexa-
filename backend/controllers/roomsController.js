const { supabase } = require('../config/db');

exports.getRooms = async (req, res) => {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, name, is_public, host_id, users!rooms_host_id_fkey(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch aggregated data for each room
    const formattedData = await Promise.all(rooms.map(async (r) => {
      // Fetch listeners count
      const { count: listenersCount } = await supabase
        .from('roommembers')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', r.id);
        
      // Fetch current song from queue
      const { data: queueData } = await supabase
        .from('queue')
        .select('song_title, song_artist, song_image')
        .eq('room_id', r.id)
        .order('created_at', { ascending: true })
        .limit(1);
        
      const currentSong = queueData?.[0] || null;
      
      // Fetch recent message
      const { data: messages } = await supabase
        .from('messages')
        .select('content, users!messages_user_id_fkey(name)')
        .eq('room_id', r.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      const recentMessage = messages?.[0] || null;

      return {
        id: r.id,
        name: r.name,
        is_public: r.is_public,
        host_id: r.host_id,
        host_name: r.users?.name || 'Host',
        listeners: listenersCount || 1,
        nowPlaying: currentSong ? {
          title: currentSong.song_title,
          artist: currentSong.song_artist,
          image: currentSong.song_image
        } : null,
        recentActivity: recentMessage ? `${recentMessage.users?.name || 'User'}: ${recentMessage.content}` : "Room created"
      };
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, host_id, isPublic } = req.body;
    
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert([{ name, host_id, is_public: isPublic }])
      .select()
      .single();

    if (roomError) throw roomError;

    const { error: memberError } = await supabase
      .from('roommembers')
      .upsert([{ room_id: room.id, user_id: host_id }]);

    if (memberError) console.error('Error adding host to members:', memberError);

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { data: members, error: membersError } = await supabase
      .from('roommembers')
      .select('users!inner(id, name, email)')
      .eq('room_id', id);

    if (membersError) throw membersError;

    const formattedMembers = members.map(m => m.users);

    res.json({ ...room, members: formattedMembers });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const { data, error } = await supabase
      .from('rooms')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    const { error } = await supabase
      .from('roommembers')
      .upsert([{ room_id: id, user_id }]);
    
    if (error) throw error;
    
    res.status(201).json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('room_id', id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addToQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const { song_uri, song_title, song_artist, song_image, added_by } = req.body;
    
    const { data, error } = await supabase
      .from('queue')
      .insert([{ room_id: id, song_uri, song_title, song_artist, song_image, added_by }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding to queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.removeFromQueue = async (req, res) => {
  try {
    const { id, songId } = req.params;
    
    const { data, error } = await supabase
      .from('queue')
      .delete()
      .match({ id: songId, room_id: id })
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Song not found in queue' });
    }
    
    res.json({ message: 'Song removed from queue' });
  } catch (error) {
    console.error('Error removing from queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
