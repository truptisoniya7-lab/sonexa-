import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params;

    const pool = getPool();
    const query = `
      SELECT * FROM CommunitySongs 
      WHERE community_id = $1 
      ORDER BY created_at ASC;
    `;
    const result = await pool.query(query, [id]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching community songs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const { id } = await params;
    const body = await request.json();
    const { song_uri, song_title, song_artist, song_image, added_by } = body;

    const pool = getPool();
    const insertQuery = `
      INSERT INTO CommunitySongs (community_id, song_uri, song_title, song_artist, song_image, added_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [id, song_uri, song_title, song_artist, song_image, added_by]);

    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding song to community:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
