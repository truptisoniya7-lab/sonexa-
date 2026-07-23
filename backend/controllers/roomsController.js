const { pool } = require('../config/db');

exports.getRooms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.name, r.is_public, r.host_id, u.name as host_name 
      FROM Rooms r 
      JOIN Users u ON r.host_id = u.id 
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, host_id, isPublic } = req.body;
    
    // Insert room
    const roomResult = await pool.query(
      `INSERT INTO Rooms (name, host_id, is_public) VALUES ($1, $2, $3) RETURNING *`,
      [name, host_id, isPublic]
    );
    const room = roomResult.rows[0];

    // Add host to RoomMembers
    await pool.query(
      `INSERT INTO RoomMembers (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [room.id, host_id]
    );

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const roomResult = await pool.query(`SELECT * FROM Rooms WHERE id = $1`, [id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const room = roomResult.rows[0];

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email FROM RoomMembers rm JOIN Users u ON rm.user_id = u.id WHERE rm.room_id = $1`,
      [id]
    );

    res.json({ ...room, members: membersResult.rows });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const result = await pool.query(
      `UPDATE Rooms SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`DELETE FROM Rooms WHERE id = $1 RETURNING *`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    await pool.query(
      `INSERT INTO RoomMembers (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, user_id]
    );
    
    res.status(201).json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM Queue WHERE room_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addToQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const { song_uri, song_title, song_artist, song_image, added_by } = req.body;
    
    const result = await pool.query(
      `INSERT INTO Queue (room_id, song_uri, song_title, song_artist, song_image, added_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, song_uri, song_title, song_artist, song_image, added_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding to queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.removeFromQueue = async (req, res) => {
  try {
    const { id, songId } = req.params;
    
    const result = await pool.query(
      `DELETE FROM Queue WHERE id = $1 AND room_id = $2 RETURNING *`,
      [songId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found in queue' });
    }
    
    res.json({ message: 'Song removed from queue' });
  } catch (error) {
    console.error('Error removing from queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
