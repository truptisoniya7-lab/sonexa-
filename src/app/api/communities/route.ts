import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const pool = getPool();
    const query = `
      SELECT c.*, u.name as owner_name,
      (SELECT COUNT(*) FROM CommunityMembers cm WHERE cm.community_id = c.id) as member_count
      FROM Communities c
      JOIN Users u ON c.owner_id = u.id
      ORDER BY c.created_at DESC;
    `;
    const result = await pool.query(query);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { name, description, owner_id } = body;

    if (!name || !owner_id) {
      return NextResponse.json({ error: 'name and owner_id are required' }, { status: 400 });
    }

    const pool = getPool();
    
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertCommunityQuery = `
        INSERT INTO Communities (name, description, owner_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const communityResult = await client.query(insertCommunityQuery, [name, description, owner_id]);
      const newCommunity = communityResult.rows[0];

      const insertMemberQuery = `
        INSERT INTO CommunityMembers (community_id, user_id, role)
        VALUES ($1, $2, $3);
      `;
      await client.query(insertMemberQuery, [newCommunity.id, owner_id, 'owner']);
      
      await client.query('COMMIT');
      
      return NextResponse.json(newCommunity, { status: 201 });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
