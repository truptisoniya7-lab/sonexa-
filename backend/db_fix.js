const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { supabase } = require('./config/db');

async function fix() {
  console.log("Fixing test track images...");
  const { data, error } = await supabase
    .from('tracks')
    .update({ thumbnail: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' })
    .like('thumbnail', '%via.placeholder.com%')
    .select();
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Updated rows:", data?.length);
  }
}

fix();
