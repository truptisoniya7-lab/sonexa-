const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { supabase } = require('./config/db');

async function testCreateRoom() {
  console.log("Testing room creation...");
  const { data, error } = await supabase
      .from('rooms')
      .insert([{ name: 'Test Room', host_id: 1, visibility: 'public' }])
      .select()
      .single();

  if (error) {
    console.error("Error creating room:", error.message, error.details);
  } else {
    console.log("Room created successfully:", data);
  }
}

testCreateRoom();
