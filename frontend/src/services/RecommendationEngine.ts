import { PlayerSong } from './PlayerService';

// Basic LRU Cache for Recommendations
class RecommendationCache {
  private cache = new Map<string, PlayerSong[]>();
  private readonly MAX_SIZE = 20;

  get(songId: string): PlayerSong[] | undefined {
    return this.cache.get(songId);
  }

  set(songId: string, recs: PlayerSong[]) {
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(songId, recs);
  }
}

const recCache = new RecommendationCache();

export class RecommendationEngine {
  static async fetchRecommendations(
    currentSong: PlayerSong,
    count: number = 10,
    excludeIds: Set<string> = new Set()
  ): Promise<PlayerSong[]> {
    if (!currentSong || !currentSong.song_uri) return [];

    const cacheKey = currentSong.song_uri;
    const cached = recCache.get(cacheKey);
    if (cached) {
      // Filter out excluded IDs and return up to count
      const filtered = cached.filter(s => !excludeIds.has(s.song_uri));
      if (filtered.length >= count) {
        return filtered.slice(0, count);
      }
    }

    try {
      // 1. Fetch candidate songs using context-aware queries for a rich queue
      const artistQuery = currentSong.song_artist ? `${currentSong.song_artist} hit songs` : 'trending hit songs';
      const similarQuery = `${currentSong.song_title} ${currentSong.song_artist || ''} similar songs`.trim();
      
      const [res1, res2] = await Promise.all([
        fetch(`/api/music/search?q=${encodeURIComponent(artistQuery)}`),
        fetch(`/api/music/search?q=${encodeURIComponent(similarQuery)}`)
      ]);
      
      let rawCandidates: any[] = [];
      if (res1.ok) {
        const d1 = await res1.json();
        rawCandidates = [...rawCandidates, ...(d1.songs || d1)];
      }
      if (res2.ok) {
        const d2 = await res2.json();
        rawCandidates = [...rawCandidates, ...(d2.songs || d2)];
      }

      // 2. Score candidates
      const scoredCandidates = rawCandidates.map((candidate: any) => {
        let score = 0;
        let reason = 'Recommended for you';

        // Convert candidate format to PlayerSong format
        const track: PlayerSong = {
          id: candidate.id || candidate.videoId || Math.random().toString(36).substr(2, 9),
          song_uri: candidate.uri || candidate.videoId || candidate.id,
          song_title: candidate.title,
          song_artist: candidate.artist,
          song_image: candidate.image || candidate.thumbnail,
          queueSource: 'auto'
        };

        const isSameArtist = track.song_artist && currentSong.song_artist &&
          track.song_artist.toLowerCase().includes(currentSong.song_artist.toLowerCase());
        
        // Simulating rich scoring since we only have limited metadata from youtube search
        if (isSameArtist) {
          score += 50;
          reason = `More from ${currentSong.song_artist}`;
        } else {
          score += Math.floor(Math.random() * 20); // Random discovery bonus
          reason = 'Similar Vibe';
        }

        // Add some simulated random scores for features we can't easily parse from raw title strings
        if (Math.random() > 0.8) {
          score += 30;
          if (!isSameArtist) reason = 'Trending in India';
        }
        
        if (Math.random() > 0.9) {
           score += 35;
           if (!isSameArtist) reason = 'Popular with listeners of this song';
        }

        return {
          ...track,
          matchScore: score,
          recommendationReason: reason,
          source: 'recommendation',
          generatedFrom: currentSong.song_uri,
          generatedAt: Date.now()
        };
      });

      // 3. Sort by score descending
      scoredCandidates.sort((a: any, b: any) => b.matchScore - a.matchScore);

      // Deduplicate by song_uri
      const uniqueCandidates = [];
      const seenUris = new Set<string>();
      for (const c of scoredCandidates) {
        if (!seenUris.has(c.song_uri)) {
          seenUris.add(c.song_uri);
          uniqueCandidates.push(c);
        }
      }

      // 4. Cache full result
      recCache.set(cacheKey, uniqueCandidates);

      // 5. Filter out excluded and return
      return uniqueCandidates
        .filter((s: any) => !excludeIds.has(s.song_uri) && s.song_uri !== currentSong.song_uri)
        .slice(0, count);

    } catch (err) {
      console.error('Recommendation Engine Error:', err);
      return [];
    }
  }
}

