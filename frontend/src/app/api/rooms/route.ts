import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const pool = getPool();
    const result = await pool.query(`
      SELECT r.id, r.name, r.is_public, r.host_id, u.name as host_name 
      FROM Rooms r 
      JOIN Users u ON r.host_id = u.id 
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const { name, host_id, isPublic } = await request.json();
    const pool = getPool();
    
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

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
