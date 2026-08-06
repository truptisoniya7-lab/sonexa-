const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in frontend/.env.local');
    return;
  }
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    const file = 'schema_play_history.sql';
    console.log(`Running ${file}...`);
    try {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await client.query(sql);
      console.log(`${file} executed successfully.`);
    } catch (err) {
       console.error(`Error executing ${file}:`, err.message);
    }
  } catch (err) {
    console.error('Error connecting to database:', err);
  } finally {
    await client.end();
  }
}

main();
