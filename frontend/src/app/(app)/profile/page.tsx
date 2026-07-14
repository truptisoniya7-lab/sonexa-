'use client';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'Alex User', email: 'alex@example.com' });

  useEffect(() => {
    // Fetch user profile on load to check if Spotify is connected
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/profile/1'); // Mocking user ID 1
        if (res.ok) {
          const data = await res.json();
          if (data.name) setUserInfo({ name: data.name, email: data.email });
          if (data.streaming_accounts?.some((acc: any) => acc.provider === 'spotify')) {
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const connectSpotify = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/spotify/login?userId=1');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to get Spotify login URL', error);
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Your Profile</h1>
        <p className="text-muted">Manage your personal information and connections.</p>
      </header>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Personal Info</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" className="input-field" defaultValue={userInfo.name} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Email</label>
            <input type="email" className="input-field" defaultValue={userInfo.email} readOnly style={{ opacity: 0.7 }} />
          </div>
          <div style={{ marginTop: '8px' }}>
            <button type="button" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Streaming Services</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#1DB954', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z"/></svg>
            </div>
            <div>
              <p style={{ fontWeight: 600 }}>Spotify</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{isConnected ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>
          <button onClick={connectSpotify} disabled={loading || isConnected} className={isConnected ? "btn btn-primary" : "btn btn-outline"} style={!isConnected ? { borderColor: '#1DB954', color: '#1DB954' } : { backgroundColor: '#1DB954', borderColor: '#1DB954' }}>
            {loading ? 'Connecting...' : (isConnected ? 'Connected' : 'Connect')}
          </button>
        </div>
      </div>
    </div>
  );
}
