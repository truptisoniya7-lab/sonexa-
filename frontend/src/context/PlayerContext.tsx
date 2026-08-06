'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface Song {
  id?: string;
  song_uri: string;
  song_title: string;
  song_artist: string;
  song_image: string;
  song_album?: string;
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
  playSong: (song: Song, addToHistory?: boolean, reason?: 'manual' | 'auto') => void;
  addToQueue: (song: Song) => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  updateQueue: (queue: Song[]) => void;
  clearQueue: () => void;
  isAutoplayEnabled: boolean;
  setIsAutoplayEnabled: (v: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

import { HistoryManager } from '../managers/HistoryManager';
import { QueueManager } from '../managers/QueueManager';
import { PlaybackManager } from '../managers/PlaybackManager';
import { LyricsManager } from '../managers/LyricsManager';

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queueManager] = useState(() => new QueueManager());
  const [queue, setQueueState] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
  const [deviceId] = useState<string | null>('youtube-player');
  const [token, setToken] = useState<string | null>(null);
  
  const hasSpotifyError = false; 

  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const playReasonRef = useRef<'manual' | 'auto'>('manual');
  const retryCountRef = useRef<number>(0);

  useEffect(() => {
    currentVideoIdRef.current = currentVideoId;
  }, [currentVideoId]);

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

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(async () => {
        if (ytPlayerRef.current) {
          const currentTime = await ytPlayerRef.current.getCurrentTime();
          const durationVal = await ytPlayerRef.current.getDuration();
          if (currentTime) {
            setProgressState(currentTime);
            // Save playback progress periodically (every 15s logic handled in manager)
            if (currentSong) {
               HistoryManager.updateProgress(currentSong, currentTime, durationVal || 1);
            }
          }
          if (durationVal && durationVal > 0) setDuration(durationVal);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentSong]);

  // Effect to generate and refresh recommendations when current song changes
  useEffect(() => {
    if (!currentSong || !isAutoplayEnabled) return;

    const refreshSmartQueue = async () => {
      const { RecommendationEngine } = await import('../services/RecommendationEngine');
      
      // Clear old recommendations ONLY if the user manually selected a completely new song
      if (playReasonRef.current === 'manual') {
        queueManager.clearAutoTracks();
      }
      
      // Collect IDs to exclude (history + manual queue items + current song)
      const excludeIds = new Set<string>();
      history.forEach(s => s.song_uri && excludeIds.add(s.song_uri));
      queueManager.getQueue().forEach((s: any) => s.song_uri && excludeIds.add(s.song_uri));
      excludeIds.add(currentSong.song_uri);

      const recs = await RecommendationEngine.fetchRecommendations(currentSong, 10, excludeIds);
      if (recs.length > 0) {
        queueManager.addAutoTracks(recs as any);
        setQueueState(queueManager.getQueue());
      }
    };

    refreshSmartQueue();
  }, [currentSong?.song_uri, isAutoplayEnabled]); // Triggered precisely when song changes

  const fetchYoutubeVideo = async (song: Song) => {
    const query = `${song.song_title} ${song.song_artist} audio`;
    const res = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.videoId;
  };

  const playSong = async (song: Song, addToHistory = true, reason: 'manual' | 'auto' = 'manual') => {
    playReasonRef.current = reason;
    retryCountRef.current = 0;

    if (addToHistory && currentSong) {
      setHistory(prev => [...prev, currentSong]);
    }

    setCurrentSong(song);
    setIsReady(false);
    
    // Check if the song is already in the queue and update currentIndex if so
    const q = queueManager.getQueue();
    const currentIdx = q.findIndex((s: any) => s.song_uri === song.song_uri);
    if (currentIdx !== -1) {
      queueManager.jumpToIndex(currentIdx);
    }
    
    // Log immediately when starting a song so it's instantly in history
    HistoryManager.logListen(song);

    // Infinite playback: Auto-fetch more recommendations if queue is running low
    if (isAutoplayEnabled) {
      const q = queueManager.getQueue();
      const currentIdx = q.findIndex((s: any) => s.song_uri === song.song_uri);
      const remaining = q.length - (currentIdx >= 0 ? currentIdx + 1 : 0);
      if (remaining > 0 && remaining < 3) {
        import('../services/RecommendationEngine').then(({ RecommendationEngine }) => {
          const excludeIds = new Set<string>();
          history.forEach(s => s.song_uri && excludeIds.add(s.song_uri));
          q.forEach((s: any) => s.song_uri && excludeIds.add(s.song_uri));
          
          RecommendationEngine.fetchRecommendations(song, 5, excludeIds).then(recs => {
            if (recs.length > 0) {
              queueManager.addAutoTracks(recs as any);
              setQueueState(queueManager.getQueue());
            }
          });
        });
      }
    }

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
    queueManager.addTrack({ ...song, queueSource: 'manual' });
    setQueueState(queueManager.getQueue());
  };

  const removeFromQueue = (index: number) => {
    queueManager.removeTrack(index);
    setQueueState(queueManager.getQueue());
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    queueManager.reorderQueue(startIndex, endIndex);
    setQueueState(queueManager.getQueue());
  };

  const updateQueue = (newQueue: Song[]) => {
    queueManager.updateQueue(newQueue);
    setQueueState(queueManager.getQueue());
  };

  const clearQueue = () => {
    queueManager.clearQueue();
    setQueueState([]);
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
    const next = queueManager.next();
    if (next) {
      setQueueState(queueManager.getQueue());
      playSong(next, true, 'auto');
    } else if (currentSong) {
      setIsReady(false);
      try {
        const query = currentSong.song_artist || currentSong.song_title;
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        // Pick a random song that isn't the current song
        const similarSongs = (data.songs || data).filter((s: any) => s.title !== currentSong.song_title);
        if (similarSongs.length > 0) {
          const similar = similarSongs[Math.floor(Math.random() * Math.min(similarSongs.length, 5))];
          playSong({
            song_uri: similar.uri || similar.youtubeId,
            song_title: similar.title,
            song_artist: similar.artist,
            song_image: similar.image
          }, true, 'auto');
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
      // Re-insert at the start of queue isn't directly supported by next/prev seamlessly, 
      // but we can manually rebuild it or just keep it simple:
      queueManager.setQueue([currentSong, ...queueManager.getQueue()]);
      setQueueState(queueManager.getQueue());
    }
    playSong(previous, false, 'auto');
  };

  const onPlayerReady = (event: YouTubeEvent) => {
    ytPlayerRef.current = event.target;
    setIsReady(true);
    event.target.setVolume(volume * 100);
    if (currentVideoIdRef.current) {
      event.target.playVideo();
    }
  };

  const handlePlayerError = async (errorCode: number) => {
    if (retryCountRef.current < 2 && currentSong) {
      retryCountRef.current += 1;
      const query = `${currentSong.song_title} ${currentSong.song_artist} audio`;
      try {
        const res = await fetch(`/api/youtube?q=${encodeURIComponent(query)}&excludeId=${currentVideoIdRef.current}`);
        if (res.ok) {
          const data = await res.json();
          if (data.videoId && data.videoId !== currentVideoIdRef.current) {
             setCurrentVideoId(data.videoId);
             if (ytPlayerRef.current) {
               ytPlayerRef.current.loadVideoById(data.videoId);
             }
             return;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch alternative track', e);
      }
    }
    // Fallback: skip track if retries exhausted
    nextTrack();
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
      playSong, addToQueue, togglePlay, play, pause, nextTrack, prevTrack, seekTo, setVolume,
      removeFromQueue, reorderQueue, updateQueue, clearQueue, isAutoplayEnabled, setIsAutoplayEnabled
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
            onError={(e) => {
              console.warn('YouTube Player Error:', e.data);
              handlePlayerError(e.data);
            }}
          />
        )}
      </div>
      {children}
    </PlayerContext.Provider>
  );
};
