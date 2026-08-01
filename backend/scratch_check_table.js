const { supabase } = require('./config/db');

async function test() {
  console.log("Testing lowercase 'rooms'...");
  const res1 = await supabase.from('rooms').select('*').limit(1);
  console.log("rooms error:", res1.error ? res1.error.message : "Success");

  console.log("\nTesting uppercase 'Rooms'...");
  const res2 = await supabase.from('Rooms').select('*').limit(1);
  console.log("Rooms error:", res2.error ? res2.error.message : "Success");
}

test();
