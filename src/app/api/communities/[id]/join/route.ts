import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const pool = getPool();
    
    const checkQuery = `SELECT * FROM CommunityMembers WHERE community_id = $1 AND user_id = $2;`;
    const checkResult = await pool.query(checkQuery, [id, user_id]);
    
    if (checkResult.rows.length > 0) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO CommunityMembers (community_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [id, user_id, 'member']);

    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
