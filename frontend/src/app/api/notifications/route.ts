import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { user_id, type, message } = body;

    if (!user_id || !type || !message) {
      return NextResponse.json({ error: 'user_id, type, and message are required' }, { status: 400 });
    }

    const pool = getPool();
    const insertQuery = `
      INSERT INTO Notifications (user_id, type, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [user_id, type, message]);

    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
