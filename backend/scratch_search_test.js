const { supabase } = require('./config/db');

async function testSearch(query) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email')
      .ilike('name', `%${query}%`)
      .limit(20);

    if (error) throw error;
    console.log("Users found for query", query, ":", users);
  } catch(e) {
    console.error(e);
  }
}

testSearch("trupti");
testSearch("gourab");
testSearch("test");
