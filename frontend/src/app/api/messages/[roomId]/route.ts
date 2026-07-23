import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    await initDB();
    const { roomId } = await params;

    const pool = getPool();
    const query = `
      SELECT m.*, u.name as user_name 
      FROM Messages m 
      JOIN Users u ON m.user_id = u.id 
      WHERE m.room_id = $1 
      ORDER BY m.created_at ASC;
    `;
    const result = await pool.query(query, [roomId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
