'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CommunityDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [community, setCommunity] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetch(`\${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}'}/communities`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(c => c.id === Number(id));
          if (found) setCommunity(found);
        }
      })
      .catch(console.error);
      
    fetchSongs();
  }, [id]);

  const fetchSongs = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/communities/${id}/songs`)
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(console.error);
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/spotify/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const addToPlaylist = async (track: any) => {
    const songData = { 
      song_uri: track.uri, 
      song_title: track.title, 
      song_artist: track.artist, 
      song_image: track.image,
      added_by: 1 
    };
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/communities/${id}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      setSearchQuery('');
      setSearchResults([]);
      fetchSongs();
    } catch (error) { console.error(error); }
  };

  const removeFromPlaylist = async (songId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/communities/${id}/songs/${songId}`, {
        method: 'DELETE'
      });
      fetchSongs();
    } catch (error) { console.error(error); }
  };

  if (!community) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Loading Community...</h2>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/communities')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '16px' }}>&larr; Back to Communities</button>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>{community.name}</h1>
        <p className="text-muted" style={{ fontSize: '18px' }}>{community.description}</p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
          <span>Created by {community.owner_name}</span>
          <span>•</span>
          <span>{community.member_count} Members</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Community Playlist</h2>
          <div className="glass-panel" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input type="text" className="input-field" placeholder="Search iTunes to add songs..." value={searchQuery} onChange={handleSearchChange} />
              {searchResults.length > 0 && searchQuery.trim() && (
                <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 50, padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {searchResults.map(track => (
                    <div key={track.id} onClick={() => addToPlaylist(track)} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--surface-hover)' }}>
                      {track.image && <img src={track.image} alt="Art" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />}
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{track.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {songs.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', marginTop: '48px' }}>Playlist is empty. Add some tracks!</p>
              ) : (
                songs.map((song, index) => (
                  <div key={song.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--surface-hover)', borderRadius: '8px' }}>
                    <div style={{ width: '24px', color: 'var(--text-muted)', textAlign: 'center' }}>{index + 1}</div>
                    {song.song_image && <img src={song.song_image} alt="Art" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{song.song_title}</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{song.song_artist}</p>
                    </div>
                    {song.added_by === 1 && (
                      <button onClick={() => removeFromPlaylist(song.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px', marginRight: '16px' }}>
                        Remove
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}>▶</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Community Chat</h2>
          <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="text-muted text-center">Chat coming soon to communities!</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <input type="text" className="input-field" placeholder="Type a message..." disabled />
              <button className="btn btn-outline" disabled>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
