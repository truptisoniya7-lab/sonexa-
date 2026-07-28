const { createClient } = require('@supabase/supabase-js');

let supabase;

const getSupabase = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn("WARNING: SUPABASE_URL or SUPABASE_KEY is missing from environment variables.");
    }
    
    supabase = createClient(supabaseUrl || 'https://dummy.supabase.co', supabaseKey || 'dummy');
  }
  return supabase;
};

module.exports = {
  supabase: getSupabase()
};
