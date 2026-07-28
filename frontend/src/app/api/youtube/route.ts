import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // Call our backend music search endpoint which uses yt-search internally
    // This avoids needing a YOUTUBE_API_KEY and avoids quota limits
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${backendUrl}/music/search?q=${encodeURIComponent(query)}`);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from backend API' }, { status: res.status });
    }

    const data = await res.json();
    
    if (data && data.length > 0) {
      // The backend returns an array of mapped songs, the youtubeId is what we need
      const videoId = data[0].youtubeId;
      return NextResponse.json({ videoId });
    } else {
      return NextResponse.json({ error: 'No video found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching YouTube video from backend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
