import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  await initDB();
  try {
    const { code, state } = await request.json();
    const userId = state;
    
    const clientId = process.env.SPOTIFY_CLIENT_ID || '';
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';
    
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const bodyParams = new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: bodyParams.toString()
    });
    
    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch token' }, { status: tokenResponse.status });
    }
    
    const tokenData = await tokenResponse.json();
    
    const pool = getPool();
    await pool.query(
      `INSERT INTO StreamingAccounts (user_id, platform, access_token, refresh_token) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, platform) 
       DO UPDATE SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token`,
      [userId, 'spotify', tokenData.access_token, tokenData.refresh_token]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in spotify callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
