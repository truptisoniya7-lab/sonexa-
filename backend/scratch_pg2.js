const { supabase } = require('./config/db');

async function check() {
  // Try to update a dummy record to see if cover_photo exists
  const { data, error } = await supabase.from('users').update({ cover_photo: 'test' }).eq('id', 1).select();
  console.log('Result:', error || 'Success');
}
check();
