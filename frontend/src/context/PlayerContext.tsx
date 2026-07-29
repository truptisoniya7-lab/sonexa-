'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface Song {
  id?: string;
  song_uri: string;
  song_title: string;
  song_artist: string;
  song_image: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isReady: boolean;
  hasSpotifyToken: boolean;
  deviceId: string | null;
  hasSpotifyError: boolean;
  playSong: (song: Song, addToHistory?: boolean) => void;
  addToQueue: (song: Song) => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [deviceId] = useState<string | null>('youtube-player');
  const [token, setToken] = useState<string | null>(null);
  
  // No longer needed, but keeping interface intact
  const hasSpotifyError = false; 

  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentVideoIdRef.current = currentVideoId;
  }, [currentVideoId]);

  // Fetch token on mount (still useful for API calls to Spotify if needed elsewhere, or we can just ignore it here)
  useEffect(() => {
    fetch('/api/spotify/token', {credentials: 'include'})
      .then(res => {
        if (!res.ok) throw new Error('No token');
        return res.json();
      })
      .then(data => {
        if (data.access_token) setToken(data.access_token);
      })
      .catch(() => console.log('User not logged into Spotify'));
  }, []);

  // Sync progress smoothly when playing
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(async () => {
        if (ytPlayerRef.current) {
          const currentTime = await ytPlayerRef.current.getCurrentTime();
          const duration = await ytPlayerRef.current.getDuration();
          if (currentTime) setProgressState(currentTime);
          if (duration && duration > 0) setDuration(duration);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying]);

  const fetchYoutubeVideo = async (song: Song) => {
    const query = `${song.song_title} ${song.song_artist} audio`;
    const res = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error('Failed to find YouTube video');
      return null;
    }
    const data = await res.json();
    return data.videoId;
  };

  const playSong = async (song: Song, addToHistory = true) => {
    if (addToHistory && currentSong) {
      setHistory(prev => [...prev, currentSong]);
    }
    setCurrentSong(song);
    setIsReady(false); // Indicates loading
    
    // Save to PostgreSQL listening history
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: '1', 
        song_id: song.song_uri,
        song_title: song.song_title,
        song_artist: song.song_artist,
        song_image: song.song_image
      })
    }).catch(err => console.error('Failed to save listening history', err));

    let videoId = null;
    if (song.song_uri && !song.song_uri.startsWith('spotify:')) {
      videoId = song.song_uri;
    } else {
      videoId = await fetchYoutubeVideo(song);
    }

    if (videoId) {
      // 1. If player exists, imperatively load for instant transition
      if (ytPlayerRef.current) {
        ytPlayerRef.current.loadVideoById(videoId);
        setCurrentVideoId(videoId); // Keep state in sync
      } else {
        // 2. Otherwise set state and wait for onReady
        setCurrentVideoId(videoId);
      }
      // 3. DO NOT set isReady(true) here. 
      // The onPlayerStateChange event will set isReady(true) when PLAYING.
    } else {
      setIsReady(true);
      console.error('Could not load song audio');
    }
  };

  const addToQueue = (song: Song) => {
    if (!queue.find(s => s.song_uri === song.song_uri)) {
      setQueue(prev => [...prev, song]);
    }
  };

  const togglePlay = () => {
    if (ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    }
  };

  const play = () => {
    if (ytPlayerRef.current) ytPlayerRef.current.playVideo();
  };

  const pause = () => {
    if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
  };
  
  const seekTo = (seconds: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(seconds, true);
      setProgressState(seconds);
    }
  };

  const setVolume = (v: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(v * 100); // YouTube volume is 0-100
      setVolumeState(v);
    }
  };

  const nextTrack = async () => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      playSong(next, true);
    } else if (currentSong) {
      setIsReady(false);
      try {
        const query = currentSong.song_artist || currentSong.song_title;
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        // Pick a random song that isn't the current song
        const similarSongs = data.filter((s: any) => s.title !== currentSong.song_title);
        if (similarSongs.length > 0) {
          const similar = similarSongs[Math.floor(Math.random() * Math.min(similarSongs.length, 5))];
          playSong({
            song_uri: similar.uri || similar.youtubeId,
            song_title: similar.title,
            song_artist: similar.artist,
            song_image: similar.image
          }, true);
        } else {
          setIsReady(true);
        }
      } catch (err) {
        console.error("Failed to fetch similar song", err);
        setIsReady(true);
      }
    }
  };

  const prevTrack = () => {
    if (progress > 3 || history.length === 0) {
      seekTo(0);
      return;
    }
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    if (currentSong) {
      setQueue(prev => [currentSong, ...prev]);
    }
    playSong(previous, false);
  };

  const onPlayerReady = (event: YouTubeEvent) => {
    ytPlayerRef.current = event.target;
    setIsReady(true);
    event.target.setVolume(volume * 100);
    if (currentVideoIdRef.current) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsReady(true);
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === YouTube.PlayerState.ENDED) {
      setIsPlaying(false);
      setProgressState(0);
      nextTrack();
    } else if (event.data === YouTube.PlayerState.BUFFERING) {
      setIsReady(false);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentSong, queue, isPlaying, progress, duration, volume, isReady, hasSpotifyToken: !!token, deviceId, hasSpotifyError,
      playSong, addToQueue, togglePlay, play, pause, nextTrack, prevTrack, seekTo, setVolume 
    }}>
      {/* Hidden YouTube Player */}
      <div className="fixed -top-[1000px] -left-[1000px] opacity-0 pointer-events-none w-0 h-0">
        {currentVideoId && (
          <YouTube 
            videoId={currentVideoId} 
            opts={{
              height: '1',
              width: '1',
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0
              }
            }}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
          />
        )}
      </div>
      {children}
    </PlayerContext.Provider>
  );
};
