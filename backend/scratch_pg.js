require('dotenv').config({ path: __dirname + '/.env' });
const { supabase } = require('./config/db');

async function check() {
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, name, is_public, host_id, users!rooms_host_id_fkey(name)')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching rooms:", error);
    return;
  }
  
  try {
    const formattedData = await Promise.all(rooms.map(async (r) => {
      const { count: listenersCount, error: err1 } = await supabase
        .from('roommembers')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', r.id);
        if (err1) throw err1;
        
      const { data: queueData, error: err2 } = await supabase
        .from('queue')
        .select('song_title, song_artist, song_image')
        .eq('room_id', r.id)
        .order('created_at', { ascending: true })
        .limit(1);
        if (err2) throw err2;
        
      const currentSong = queueData?.[0] || null;
      
      const { data: messages, error: err3 } = await supabase
        .from('messages')
        .select('content, users!messages_user_id_fkey(name)')
        .eq('room_id', r.id)
        .order('created_at', { ascending: false })
        .limit(1);
        if (err3) throw err3;
        
      const recentMessage = messages?.[0] || null;

      return {
        id: r.id,
        name: r.name,
      };
    }));
    
    console.log("Formatted:", formattedData.length);
  } catch (err) {
    console.error("Error in formatting:", err);
  }
}
check();
