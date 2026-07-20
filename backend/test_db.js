const { pool } = require('./config/db');

async function testQuery() {
  try {
    const id = 1;
    const song_uri = 'test_uri';
    const song_title = 'test_title';
    const song_artist = 'test_artist';
    const song_image = 'test_image';
    const added_by = 1;

    console.log('Inserting...');
    const result = await pool.query(
      'INSERT INTO Queue (room_id, song_uri, song_title, song_artist, song_image, added_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [id, song_uri, song_title, song_artist, song_image, added_by]
    );
    console.log('Inserted ID:', result.rows[0].id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

testQuery();
