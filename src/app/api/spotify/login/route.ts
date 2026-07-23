import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  await initDB();
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || '1';
  
  const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
    state: userId
  });
  
  const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  return NextResponse.json({ url: authorizeUrl });
}
