import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  
  try {
    const pool = getPool();
    const userResult = await pool.query('SELECT id, email, name, profile_picture, provider, created_at FROM Users WHERE id = $1', [id]);
    const user = userResult.rows[0];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const streamingAccountsResult = await pool.query('SELECT platform, platform_user_id, updated_at FROM StreamingAccounts WHERE user_id = $1', [id]);
    user.streaming_accounts = streamingAccountsResult.rows;
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  const { name } = await request.json();
  
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  
  try {
    const pool = getPool();
    const result = await pool.query('UPDATE Users SET name = $1 WHERE id = $2 RETURNING id, email, name, profile_picture, provider', [name, id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
