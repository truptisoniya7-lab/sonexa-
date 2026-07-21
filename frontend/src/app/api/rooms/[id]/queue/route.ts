import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const pool = getPool();
    
    const result = await pool.query(
      `SELECT * FROM Queue WHERE room_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const { song_uri, song_title, song_artist, song_image, added_by } = await request.json();
    const pool = getPool();
    
    const result = await pool.query(
      `INSERT INTO Queue (room_id, song_uri, song_title, song_artist, song_image, added_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, song_uri, song_title, song_artist, song_image, added_by]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
