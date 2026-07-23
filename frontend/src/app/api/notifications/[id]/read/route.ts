import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params;

    const pool = getPool();
    const updateQuery = `
      UPDATE Notifications 
      SET is_read = true 
      WHERE id = $1
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [id]);

    if (updateResult.rowCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
