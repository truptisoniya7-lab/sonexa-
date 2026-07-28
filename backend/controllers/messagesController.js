const { supabase } = require('../config/db');

exports.createMessage = async (req, res) => {
  try {
    const { room_id, user_id, content, type } = req.body;

    if (!room_id || !user_id || !content) {
      return res.status(400).json({ error: 'room_id, user_id, and content are required' });
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('messages')
      .insert([{ room_id, user_id, content, type: type || 'text' }])
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: selectResult, error: selectError } = await supabase
      .from('messages')
      .select('*, users!inner(name)')
      .eq('id', insertResult.id)
      .single();

    if (selectError) throw selectError;

    const formattedResult = {
      ...selectResult,
      user_name: selectResult.users?.name
    };
    delete formattedResult.users;

    res.status(201).json(formattedResult);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*, users!inner(name)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(m => {
      const user_name = m.users?.name;
      const { users, ...rest } = m;
      return { ...rest, user_name };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
