export function parseTrackMetadata(rawTitle: string, rawArtist: string) {
  let title = rawTitle || '';
  let artist = rawArtist?.replace('@', '') || '';
  let album = 'Unknown Album';
  
  // Remove common YouTube cruft using a safe regex
  title = title.replace(/\[.*?\]|\(.*?\)|official video|music video|lyric video|lyrical video|lyrical:|lyrical -|lyrical|audio|remix/gi, '').trim();

  // Try to parse format: "Song Title - Album Name | Artist" or "Song Title | Album | Artist"
  const parts = title.split(/[-|]/).map(p => p.trim()).filter(Boolean);
  
  if (parts.length >= 3) {
    title = parts[0];
    album = parts[1];
    if (!artist || artist.toLowerCase().includes('various')) {
      artist = parts[2];
    }
  } else if (parts.length === 2) {
    title = parts[0];
    // If second part looks like an artist, use it as artist, otherwise album
    if (artist && parts[1].toLowerCase().includes(artist.toLowerCase())) {
       // It's the artist
    } else if (!artist) {
       artist = parts[1];
    } else {
       album = parts[1];
    }
  }
  
  return {
    song_title: title.trim(),
    song_artist: artist.trim(),
    song_album: album.trim()
  };
}
