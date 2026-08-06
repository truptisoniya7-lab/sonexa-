const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
  // Check if users table exists and insert user 1 if possible
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([{ id: 1, email: 'mockuser@example.com', name: 'Mock User' }])
    .select();
  
  if (userError) {
    console.log('Error inserting user:', userError.message);
  } else {
    console.log('Inserted user:', userData);
  }
}
main();
