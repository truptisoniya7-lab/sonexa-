const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('user_listening_history')
    .delete()
    .eq('track_id', 'mock_song_test');
    
  if (error) {
    console.error('Error deleting mock song:', error.message);
  } else {
    console.log('Successfully deleted mock song:', data);
  }
}
main();
