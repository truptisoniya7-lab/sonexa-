import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) {
  try {
    await initDB();
    const { id, songId } = await params;
    const pool = getPool();
    
    const result = await pool.query(
      `DELETE FROM Queue WHERE id = $1 AND room_id = $2 RETURNING *`,
      [songId, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found in queue' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Song removed from queue' });
  } catch (error) {
    console.error('Error removing from queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
