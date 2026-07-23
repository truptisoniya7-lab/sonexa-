import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  try {
    const { id } = await params;
    const pool = getPool();
    
    const query = `
      SELECT u.id, u.email, u.name, f.status 
      FROM Friendships f
      JOIN Users u ON (f.user_id1 = u.id OR f.user_id2 = u.id)
      WHERE (f.user_id1 = $1 OR f.user_id2 = $2) AND u.id != $3
    `;
    
    const result = await pool.query(query, [id, id, id]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
