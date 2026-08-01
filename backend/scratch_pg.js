const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:3hgAef9rc%25Zjt*G@db.homxxtclvugnqvolnqby.supabase.co:5432/postgres",
});

async function check() {
  try {
    await client.connect();
    const res = await client.query(`SELECT id, name, email FROM users LIMIT 5`);
    console.log("Users:", res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
check();
