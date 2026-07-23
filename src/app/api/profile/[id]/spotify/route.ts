import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB();
  const { id } = await params;
  const { access_token, refresh_token, spotify_user_id } = await request.json();
  
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: 'Tokens are required' }, { status: 400 });
  }
  
  try {
    const pool = getPool();
    const existing = await pool.query('SELECT * FROM StreamingAccounts WHERE user_id = $1 AND platform = $2', [id, 'spotify']);
    
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE StreamingAccounts SET access_token = $1, refresh_token = $2, platform_user_id = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4 AND platform = $5',
        [access_token, refresh_token, spotify_user_id || existing.rows[0].platform_user_id, id, 'spotify']
      );
    } else {
      await pool.query(
        'INSERT INTO StreamingAccounts (user_id, platform, platform_user_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
        [id, 'spotify', spotify_user_id || 'unknown', access_token, refresh_token]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving spotify account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
