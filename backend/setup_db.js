const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in .env');
    return;
  }
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    console.log('Running listening_history.sql...');
    const histSql = fs.readFileSync(path.join(__dirname, 'listening_history.sql'), 'utf8');
    await client.query(histSql);
    console.log('listening_history.sql executed successfully.');

    console.log('Running rooms_schema.sql...');
    const roomsSql = fs.readFileSync(path.join(__dirname, 'rooms_schema.sql'), 'utf8');
    await client.query(roomsSql);
    console.log('rooms_schema.sql executed successfully.');

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

main();
