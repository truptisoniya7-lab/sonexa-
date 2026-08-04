/**
 * SearchRankingService.js
 * Normalizes, filters, scores, and deduplicates YouTube search results
 * to provide a premium, music-first Spotify-like search experience.
 */

class SearchRankingService {
  /**
   * Cleans the title by removing all common YouTube suffixes and junk.
   */
  static normalizeTitle(title) {
    if (!title) return '';
    let t = title.toLowerCase();

    // Remove brackets and parentheses content commonly used for video types
    t = t.replace(/\[.*?\]/g, '');
    t = t.replace(/\(.*?\)/g, '');

    // Remove common keywords
    const removeKeywords = [
      'official video', 'official music video', 'official audio', 'lyric video',
      'lyrics', 'music video', 'audio', 'remix', 'hd', '4k', 'visualizer',
      'vevo', '- topic', 'full video'
    ];

    for (const kw of removeKeywords) {
      t = t.replace(new RegExp(kw, 'gi'), '');
    }

    // Clean up feat/ft
    t = t.replace(/ft\..*|feat\..*/gi, '');

    // Remove anything after a pipe or dash if it looks like junk
    t = t.replace(/\|.*/, '');
    
    // Normalize whitespace and punctuation
    return t.replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  }

  static normalizeArtist(artist) {
    if (!artist) return '';
    let a = artist.toLowerCase();
    a = a.replace(/vevo/g, '');
    a = a.replace(/- topic/g, '');
    a = a.replace(/official/g, '');
    return a.replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  }

  /**
   * Generates a quality score based on the title, channel name, and metrics.
   */
  static calculateScore(video, searchQuery) {
    let score = 0;
    const title = video.title.toLowerCase();
    const author = video.author.name.toLowerCase();
    const q = searchQuery.toLowerCase();

    // Positive Scoring
    if (author.includes('official')) score += 100;
    if (title.includes('official audio')) score += 95;
    if (author.includes('- topic')) score += 90;
    if (author.includes('vevo')) score += 85;
    if (author.includes('music') || author.includes('records')) score += 80; // Labels

    // Relevance
    const normTitle = this.normalizeTitle(video.title);
    if (normTitle === q) score += 40;
    if (this.normalizeArtist(video.author.name) === q) score += 40;

    // Engagement
    if (video.views > 10000000) score += 20; // 10M+ views
    else if (video.views > 1000000) score += 10; // 1M+ views

    // Negative Scoring (Filter junk)
    if (title.includes('#shorts') || video.seconds < 60) score -= 100;
    if (title.includes('podcast') || author.includes('podcast')) score -= 80;
    if (title.includes('reaction') || author.includes('reacts')) score -= 70;
    if (title.includes('cover')) score -= 60;
    if (title.includes('karaoke') || title.includes('instrumental')) score -= 60;
    if (title.includes('live') || title.includes('concert')) score -= 50;
    if (title.includes('slowed')) score -= 50;
    if (title.includes('reverb')) score -= 50;
    if (title.includes('remix')) score -= 50;
    if (title.includes('nightcore')) score -= 40;
    if (title.includes('8d')) score -= 40;
    
    // Additional junk patterns
    if (title.includes('interview') || title.includes('vlog') || title.includes('movie clip') || title.includes('status') || title.includes('gameplay')) {
      score -= 100;
    }

    // Strict Music-Only Negative Filters (Reject TV serials, Promos, Scenes, etc)
    const strictJunk = [
      'episode', 'serial', 'promo', 'scene', 'clip', 'dialogue', 
      'trailer', 'teaser', 'full movie', 'comedy', 'news', 'interview',
      'podcast', 'reaction', 'status', 'shorts', 'vlog', 'bts', 
      'making', 'behind the scenes', 'tarang tv', 'sidharth tv',
      'mega serial', 'reality show'
    ];
    for (const junk of strictJunk) {
      if (title.includes(junk) || author.includes(junk)) {
        score -= 500; // Guaranteed reject
      }
    }

    return score;
  }

  static getSourceBadge(video) {
    const title = video.title.toLowerCase();
    const author = video.author.name.toLowerCase();

    if (author.includes('- topic')) return 'Topic';
    if (author.includes('vevo')) return 'VEVO';
    if (title.includes('official audio')) return 'Official Audio';
    if (title.includes('official video') || title.includes('official music video')) return 'Official Video';
    if (author.includes('official')) return 'Official Artist';
    
    return null;
  }

  /**
   * Main pipeline: process YouTube search results.
   */
  static processResults(ytVideos, searchQuery, skipDedupe = false) {
    if (!ytVideos || !Array.isArray(ytVideos)) return [];
    
    const uniqueMap = new Map();
    const rawResults = [];

    for (const video of ytVideos) {
      if (!video || !video.title || !video.author) continue;

      const score = this.calculateScore(video, searchQuery);
      
      // Hard filter: anything below 0 is likely non-music junk, ignore it
      if (score < 0) continue;
      // Hard filter length: songs are rarely over 10 mins or under 1 min
      if (video.seconds < 60 || video.seconds > 600) continue;

      const normTitle = this.normalizeTitle(video.title);
      const normArtist = this.normalizeArtist(video.author.name);
      
      // We use a combination of normalized title and first 3 chars of artist to aggressively deduplicate
      const dedupeKey = `${normTitle}-${normArtist.substring(0, 5)}`;

      const processedVideo = {
        id: video.videoId,
        uri: video.videoId,
        title: this.cleanDisplayTitle(video.title),
        artist: video.author.name.replace(/ - Topic|VEVO/gi, '').trim(),
        image: video.thumbnail,
        duration: video.seconds,
        youtubeId: video.videoId,
        score: score,
        sourceBadge: this.getSourceBadge(video),
        isVerified: score >= 85
      };
      
      if (skipDedupe) {
        rawResults.push(processedVideo);
        continue;
      }

      if (!uniqueMap.has(dedupeKey)) {
        uniqueMap.set(dedupeKey, processedVideo);
      } else {
        const existing = uniqueMap.get(dedupeKey);
        if (processedVideo.score > existing.score) {
          uniqueMap.set(dedupeKey, processedVideo);
        }
      }
    }

    // Convert map to array and sort by score
    const results = skipDedupe ? rawResults : Array.from(uniqueMap.values());
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Clean the title for UI display (so it looks like Spotify)
   */
  static cleanDisplayTitle(title) {
    if (!title) return '';
    let t = title;
    t = t.replace(/\[(?:Official|Lyric|Music|HD|4K|Visualizer).*?\]/gi, '');
    t = t.replace(/\((?:Official|Lyric|Music|HD|4K|Visualizer).*?\)/gi, '');
    t = t.replace(/\|.*?(?:Official|Music Video).*/gi, '');
    return t.trim();
  }
}

module.exports = SearchRankingService;
