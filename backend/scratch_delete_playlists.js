const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const titlesToDelete = [
    'Late Night Lofi',
    'Bollywood Party 2026',
    'Acoustic Morning',
    'Workout Hype'
  ];

  const { data, error } = await supabase
    .from('playlists')
    .delete()
    .in('name', titlesToDelete);
    
  if (error) {
    console.error('Error deleting mock playlists:', error.message);
  } else {
    console.log('Successfully deleted mock playlists');
  }
}
main();
