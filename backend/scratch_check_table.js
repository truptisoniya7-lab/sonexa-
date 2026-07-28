const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://homxxtclvugnqvolnqby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbXh4dGNsdnVnbnF2b2xucWJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg4Mjk0NywiZXhwIjoyMTAwNDU4OTQ3fQ.pjnmnrD-3VFxfYPfDjfbNP-0b7Ls3ufdsdPm4T9yZV0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  const { data, error } = await supabase.from('listening_history').select('*').limit(1);
  if (error) {
    console.error('Table error:', error);
  } else {
    console.log('Table exists:', data);
  }
}

checkTable();
