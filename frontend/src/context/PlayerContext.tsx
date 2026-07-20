'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Maximize, Minimize } from 'lucide-react';

interface Song {
  id?: number;
  song_uri: string;
  song_title: string;
  song_artist: string;
  song_image: string;
  room_id?: string;
}

interface PlayerContextType {
  ytPlayer: any;
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  setProgress: (p: number) => void;
  seekTo: (seconds: number) => void;
  setOnEndedCallback: (cb: () => void) => void;
  videoState: { rect: DOMRect | null; isVisible: boolean; isMaximized?: boolean };
  setVideoState: React.Dispatch<React.SetStateAction<{ rect: DOMRect | null; isVisible: boolean; isMaximized?: boolean }>>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoState, setVideoState] = useState<{ rect: DOMRect | null; isVisible: boolean; isMaximized?: boolean }>({ rect: null, isVisible: false, isMaximized: false });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);

  const setOnEndedCallback = (cb: () => void) => {
    onEndedRef.current = cb;
  };

  const initYouTubePlayer = () => {
    if (!(window as any).YT || !(window as any).YT.Player) return;
    const player = new (window as any).YT.Player('global-youtube-player', {
      height: '100%',
      width: '100%',
      videoId: '',
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      },
      events: {
        onReady: (event: any) => {
          setYtPlayer(event.target);
        },
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(event.target.getDuration());
            
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              setProgressState(event.target.getCurrentTime());
            }, 1000);
          } else if (event.data === 0) { // ENDED
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (onEndedRef.current) onEndedRef.current();
          } else {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }
      }
    });
  };

  useEffect(() => {
    (window as any).onYouTubeIframeAPIReady = () => {
      initYouTubePlayer();
    };
    if ((window as any).YT && (window as any).YT.Player && !ytPlayer) {
      initYouTubePlayer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ytPlayer]);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    const isYouTube = song.song_uri?.length === 11;
    if (isYouTube && ytPlayer) {
      ytPlayer.loadVideoById(song.song_uri);
      ytPlayer.playVideo();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!currentSong || !ytPlayer) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
      setIsPlaying(false);
    } else {
      ytPlayer.playVideo();
      setIsPlaying(true);
    }
  };

  const play = () => {
    if (ytPlayer && currentSong) {
      ytPlayer.playVideo();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (ytPlayer && currentSong) {
      ytPlayer.pauseVideo();
      setIsPlaying(false);
    }
  };
  
  const seekTo = (seconds: number) => {
    if (ytPlayer) {
      ytPlayer.seekTo(seconds, true);
      setProgressState(seconds);
    }
  };

  return (
    <PlayerContext.Provider value={{ ytPlayer, currentSong, isPlaying, progress, duration, playSong, togglePlay, play, pause, setProgress: setProgressState, seekTo, setOnEndedCallback, videoState, setVideoState }}>
      {children}
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      {/* Global YouTube Player */}
      <div 
        className="group"
        style={{ 
          position: videoState.isMaximized ? 'fixed' : 'absolute', 
          top: videoState.isMaximized ? '0' : (videoState.isVisible && videoState.rect ? videoState.rect.top : '-9999px'), 
          left: videoState.isMaximized ? '0' : (videoState.isVisible && videoState.rect ? videoState.rect.left : '-9999px'),
          width: videoState.isMaximized ? '100vw' : (videoState.isVisible && videoState.rect ? videoState.rect.width : '1px'),
          height: videoState.isMaximized ? '100vh' : (videoState.isVisible && videoState.rect ? videoState.rect.height : '1px'),
          opacity: videoState.isVisible || videoState.isMaximized ? 1 : 0,
          pointerEvents: videoState.isVisible || videoState.isMaximized ? 'auto' : 'none',
          zIndex: videoState.isMaximized ? 9999 : 50,
          borderRadius: videoState.isMaximized ? '0' : '0.75rem',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div id="global-youtube-player" style={{ width: '100%', height: '100%', borderRadius: videoState.isMaximized ? '0' : '16px', overflow: 'hidden' }}></div>
        {(videoState.isVisible || videoState.isMaximized) && (
          <button 
            onClick={() => setVideoState(prev => ({ ...prev, isMaximized: !prev.isMaximized }))}
            style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10000 }}
            className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-2xl border border-white/10"
          >
            {videoState.isMaximized ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>
        )}
      </div>
    </PlayerContext.Provider>
  );
};
