const { Pool } = require('pg');

async function checkUser() {
  const DATABASE_URL = "postgresql://postgres:3hgAef9rc%25Zjt*G@db.dpyzsrudkwaedeahgekj.supabase.co:5432/postgres";
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM Users WHERE email = $1', ['truptisoniya7@gmail.com']);
    console.log("User found:", res.rows);
    client.release();
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
}

checkUser();
