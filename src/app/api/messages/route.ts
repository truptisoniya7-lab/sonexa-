import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { room_id, user_id, content, type } = body;

    if (!room_id || !user_id || !content) {
      return NextResponse.json({ error: 'room_id, user_id, and content are required' }, { status: 400 });
    }

    const pool = getPool();
    const insertQuery = `
      INSERT INTO Messages (room_id, user_id, content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const insertResult = await pool.query(insertQuery, [room_id, user_id, content, type || 'text']);
    const newMessageId = insertResult.rows[0].id;

    const selectQuery = `
      SELECT m.*, u.name as user_name 
      FROM Messages m 
      JOIN Users u ON m.user_id = u.id 
      WHERE m.id = $1;
    `;
    const selectResult = await pool.query(selectQuery, [newMessageId]);

    return NextResponse.json(selectResult.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
