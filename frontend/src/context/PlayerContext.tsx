'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Script from 'next/script';

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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);

  const setOnEndedCallback = (cb: () => void) => {
    onEndedRef.current = cb;
  };

  const initYouTubePlayer = () => {
    if (!(window as any).YT || !(window as any).YT.Player) return;
    const player = new (window as any).YT.Player('global-youtube-player', {
      height: '1',
      width: '1',
      videoId: '',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1
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
    <PlayerContext.Provider value={{ ytPlayer, currentSong, isPlaying, progress, duration, playSong, togglePlay, play, pause, setProgress: setProgressState, seekTo, setOnEndedCallback }}>
      {children}
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      {/* Invisible Global Player */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div id="global-youtube-player"></div>
      </div>
    </PlayerContext.Provider>
  );
};
