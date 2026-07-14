const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function seed() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Seed mock user 1
  await db.run('INSERT OR IGNORE INTO Users (id, email, name) VALUES (1, "truptisoniya7@gmail.com", "Soniya")');

  const users = await db.all('SELECT * FROM Users');
  const streaming = await db.all('SELECT * FROM StreamingAccounts');
  const rooms = await db.all('SELECT * FROM Rooms');

  console.log('Users:', users);
  console.log('StreamingAccounts:', streaming);
  console.log('Rooms:', rooms);
}

seed().catch(console.error);
