import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; songId: string }> }) {
  try {
    await initDB();
    const { id, songId } = await params;

    const pool = getPool();
    const deleteQuery = `
      DELETE FROM CommunitySongs 
      WHERE id = $1 AND community_id = $2
      RETURNING *;
    `;
    const deleteResult = await pool.query(deleteQuery, [songId, id]);

    if (deleteResult.rowCount === 0) {
        return NextResponse.json({ error: 'Song not found in community' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Song removed successfully' });
  } catch (error) {
    console.error('Error removing song from community:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
