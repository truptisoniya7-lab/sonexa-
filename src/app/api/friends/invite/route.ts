import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  await initDB();
  try {
    const { user_id, friend_email } = await request.json();
    const pool = getPool();
    
    const friendResult = await pool.query('SELECT id FROM Users WHERE email = $1', [friend_email]);
    if (friendResult.rows.length === 0) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 });
    }
    
    const friend_id = friendResult.rows[0].id;
    if (user_id === friend_id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO Friendships (user_id1, user_id2, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [user_id, friend_id, 'pending']
    );

    return NextResponse.json({ success: true, message: 'Friend invite sent' });
  } catch (error) {
    console.error('Error in invite friend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
