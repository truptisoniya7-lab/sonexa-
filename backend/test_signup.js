require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testSignup() {
  console.log('Testing Supabase Insert without display_name...');
  const baseUsername = 'testuser123';
  const email = `test123_${Math.random()}@gmail.com`;

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        name: baseUsername, 
        username: baseUsername, 
        password_hash: '123456', 
        provider: 'local' 
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error with username:', error);
    } else {
      console.log('Success with username:', data);
    }

    const { data: d3, error: e3 } = await supabase
      .from('users')
      .insert([{ 
        email: `test456_${Math.random()}@gmail.com`, 
        name: baseUsername, 
        password_hash: '123456', 
        provider: 'local' 
      }])
      .select()
      .single();

    if (e3) {
      console.error('Supabase Error only name:', e3);
    } else {
      console.log('Success only name:', d3);
    }
  } catch(e) {
    console.error(e);
  }
}

testSignup();
