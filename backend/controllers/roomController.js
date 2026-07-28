const { supabase } = require('../config/db');

// Get all active rooms
exports.getRooms = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Rooms')
      .select(`
        id, name, description, cover_type, custom_cover_image, genre, host_id, visibility, status, max_members, voice_enabled,
        Users!Rooms_host_id_fkey(id, username, display_name, avatar)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, description, genre, host_id, visibility, voice_enabled } = req.body;
    
    // 1. Create the room
    const { data: room, error: roomError } = await supabase
      .from('Rooms')
      .insert([{ name, description, genre, host_id, visibility, voice_enabled }])
      .select()
      .single();

    if (roomError) throw roomError;

    // 2. Add the host as a RoomMember with role 'host'
    const { error: memberError } = await supabase
      .from('RoomMembers')
      .insert([{ room_id: room.id, user_id: host_id, role: 'host', is_muted: true, is_speaking: false }]);

    if (memberError) console.error('Error adding host to members:', memberError);

    // 3. Create default RoomSettings
    await supabase.from('RoomSettings').insert([{ room_id: room.id }]);

    // 4. Create empty PlaybackState
    await supabase.from('PlaybackState').insert([{ room_id: room.id }]);

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a specific room by ID
exports.getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: room, error: roomError } = await supabase
      .from('Rooms')
      .select(`
        *,
        Users!Rooms_host_id_fkey(id, username, display_name, avatar)
      `)
      .eq('id', id)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update room details
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('Rooms')
      .update(updates)
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

// Delete or end a room
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of hard deleting, we could update status to 'ended', but we'll stick to delete for now
    const { data, error } = await supabase
      .from('Rooms')
      .update({ status: 'ended' })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room ended successfully', data });
  } catch (error) {
    console.error('Error ending room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
