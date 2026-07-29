const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('listening_history').select('*').limit(1);
  if (error) {
    console.error('Error fetching listening_history (maybe it does not exist?):', error.message);
  } else {
    console.log('listening_history exists!', data);
  }
}
main();
