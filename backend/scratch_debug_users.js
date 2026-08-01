require('dotenv').config();
const { supabase } = require('./config/db');

async function debugUsers() {
  const { data: users } = await supabase.from('users').select('*');
  console.log("Users in DB:", users);
}

debugUsers();
