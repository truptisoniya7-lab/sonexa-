import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const pool = getPool();
    
    const roomResult = await pool.query(`SELECT * FROM Rooms WHERE id = $1`, [id]);
    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = roomResult.rows[0];

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email FROM RoomMembers rm JOIN Users u ON rm.user_id = u.id WHERE rm.room_id = $1`,
      [id]
    );

    return NextResponse.json({ ...room, members: membersResult.rows });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const { name } = await request.json();
    const pool = getPool();
    
    const result = await pool.query(
      `UPDATE Rooms SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const pool = getPool();
    
    const result = await pool.query(`DELETE FROM Rooms WHERE id = $1 RETURNING *`, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
