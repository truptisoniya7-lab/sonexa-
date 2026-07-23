import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
const ytSearch = require('yt-search');

const sanitizeTitle = (title: string) => {
  return title
    .replace(/\s*[\[\(\{](official.*|lyric.*|audio|video|hd|4k|music video|visualizer)[\]\)\}]\s*/gi, '')
    .replace(/\s*\|\s*.*$/g, '')
    .replace(/\s*\-?\s*official.*$/gi, '')
    .trim();
};

export async function GET(request: NextRequest) {
  await initDB();
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json([]);
  }
  
  try {
    const result = await ytSearch(q);
    const topResults = result.videos.slice(0, 5).map((item: any) => ({
      id: item.videoId,
      uri: item.videoId,
      title: sanitizeTitle(item.title),
      artist: item.author.name,
      image: item.thumbnail,
      duration: item.timestamp,
      popularity: item.views
    }));
    
    return NextResponse.json(topResults);
  } catch (error) {
    console.error('Error in spotify search:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
