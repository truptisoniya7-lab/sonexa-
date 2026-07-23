import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const { user_id } = await request.json();
    const pool = getPool();
    
    await pool.query(
      `INSERT INTO RoomMembers (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, user_id]
    );
    
    return NextResponse.json({ message: 'Joined room successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
