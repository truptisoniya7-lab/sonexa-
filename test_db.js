const { Pool } = require('pg');

async function test() {
  const DATABASE_URL = "postgresql://postgres:3hgAef9rc%25Zjt*G@db.dpyzsrudkwaedeahgekj.supabase.co:5432/postgres";
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    console.log("Connected to DB");
    
    // Check if Users table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log("Users table exists:", res.rows[0].exists);

    // Try a simple insert or select
    const testEmail = "test@example.com";
    const userRes = await client.query('SELECT * FROM Users WHERE email = $1', [testEmail]);
    console.log("User query result:", userRes.rows);

    client.release();
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
}

test();
