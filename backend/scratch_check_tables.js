const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: data1, error: err1 } = await supabase.from('listening_history').select('*').limit(5);
  console.log('listening_history:', err1 ? err1.message : data1);

  const { data: data2, error: err2 } = await supabase.from('user_listening_history').select('*').limit(5);
  console.log('user_listening_history:', err2 ? err2.message : data2);
}
main();
