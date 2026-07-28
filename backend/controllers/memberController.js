const { supabase } = require('../config/db');

exports.joinRoom = async (req, res) => {
  try {
    const { id: room_id } = req.params;
    const { user_id } = req.body;
    
    // Check if user is already in the room
    const { data: existingMember } = await supabase
      .from('RoomMembers')
      .select('id')
      .eq('room_id', room_id)
      .eq('user_id', user_id)
      .single();

    if (existingMember) {
      // Update last seen
      await supabase
        .from('RoomMembers')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', existingMember.id);
      return res.status(200).json({ message: 'Already joined', data: existingMember });
    }

    // Insert new member
    const { data, error } = await supabase
      .from('RoomMembers')
      .insert([{ room_id, user_id, role: 'listener' }])
      .select()
      .single();
    
    if (error) throw error;

    // Log Activity
    await supabase.from('RoomActivity').insert([{
      room_id,
      user_id,
      type: 'joined',
      payload: {}
    }]);
    
    res.status(201).json({ message: 'Joined room successfully', data });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const { id: room_id } = req.params;
    const { user_id } = req.body; // or req.user.id if auth is implemented
    
    const { error } = await supabase
      .from('RoomMembers')
      .delete()
      .match({ room_id, user_id });
    
    if (error) throw error;

    // Log Activity
    await supabase.from('RoomActivity').insert([{
      room_id,
      user_id,
      type: 'left',
      payload: {}
    }]);
    
    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const { id: room_id } = req.params;

    const { data, error } = await supabase
      .from('RoomMembers')
      .select(`
        *,
        Users (id, username, display_name, avatar)
      `)
      .eq('room_id', room_id);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
