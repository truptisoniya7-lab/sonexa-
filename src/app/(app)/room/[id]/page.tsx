'use client';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EmojiPicker from 'emoji-picker-react';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Play, Pause, SkipForward, SkipBack, Smile, Send, Search, X, Heart, Flame, Music, Laugh, PartyPopper, ChevronUp, ChevronDown, User, Users, Activity, Clock, Eye, Library, MoreHorizontal, ArrowUp, History, Lock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

const MOCK_MEMBERS = [
  { id: 1, name: 'You (Host)', avatar: 'https://i.pravatar.cc/150?u=1', role: 'Host', isSpeaking: false },
  { id: 2, name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=2', role: 'Listener', isSpeaking: true },
  { id: 3, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=3', role: 'Listener', isSpeaking: false },
];

export default function RoomPage() {
  const { id } = useParams();

  const channelRef = useRef<RealtimeChannel | null>(null);
  const [roomName, setRoomName] = useState('Loading Room...');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'members'>('queue');

  // Queue State
  const [queue, setQueue] = useState<any[]>([]);
  const [newSong, setNewSong] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Playback State
  const { playSong, togglePlay: globalTogglePlay, isPlaying: globalIsPlaying, currentSong: globalCurrentSong, setOnEndedCallback, progress, duration, seekTo, setVideoState } = usePlayer();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  
  // Display Modes
  const [playerMode, setPlayerMode] = useState<'video' | 'lyrics'>('video');
  const videoPlaceholderRef = useRef<HTMLDivElement>(null);
  
  const currentSong = queue[currentSongIndex] || null;

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reactions State
  const [activeReactions, setActiveReactions] = useState<{id: string, emoji: string, right?: number}[]>([]);
  
  // WebRTC State
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch(`/api/rooms/${id}`)
      .then(res => res.json())
      .then(data => setRoomName(data.name))
      .catch(console.error);

    fetch(`/api/rooms/${id}/queue`)
      .then(res => res.json())
      .then(data => {
        // Add mock votes if missing
        const queueWithVotes = data.map((item: any) => ({ ...item, votes: Math.floor(Math.random() * 5) }));
        setQueue(queueWithVotes);
      })
      .catch(console.error);
      
    fetch(`/api/messages/${id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    fetch(`/api/spotify/trending`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTrendingSongs(data); })
      .catch(console.error);

    const channel = supabase.channel(`room:${id}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'queue_updated' }, () => {
        fetch(`/api/rooms/${id}/queue`)
          .then(res => res.json())
          .then(data => {
            const queueWithVotes = data.map((item: any) => ({ ...item, votes: Math.floor(Math.random() * 5) }));
            setQueue(queueWithVotes);
          });
      })
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload]);
      })
      .on('broadcast', { event: 'new_reaction' }, ({ payload }) => {
        const reaction = { id: Math.random().toString(), emoji: payload.reaction, right: Math.floor(Math.random() * 20) + 10 };
        setActiveReactions(prev => [...prev, reaction]);
        setTimeout(() => {
          setActiveReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 3000);
      })
      .on('broadcast', { event: 'playback_synced' }, ({ payload }) => {
        if (payload.state === 'play' && !globalIsPlaying) {
          globalTogglePlay();
        } else if (payload.state === 'pause' && globalIsPlaying) {
          globalTogglePlay();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSong(e.target.value);
  };

  useEffect(() => {
    const updateVideoPosition = () => {
      if (playerMode === 'video' && videoPlaceholderRef.current) {
        const rect = videoPlaceholderRef.current.getBoundingClientRect();
        setVideoState({ 
          isVisible: true, 
          rect: new DOMRect(
            rect.left + window.scrollX,
            rect.top + window.scrollY,
            rect.width,
            rect.height
          ) 
        });
      } else {
        setVideoState({ isVisible: false, rect: null });
      }
    };

    updateVideoPosition();

    window.addEventListener('resize', updateVideoPosition);
    
    let observer: ResizeObserver | null = null;
    if (videoPlaceholderRef.current) {
      observer = new ResizeObserver(() => {
        updateVideoPosition();
      });
      observer.observe(videoPlaceholderRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateVideoPosition);
      if (observer) observer.disconnect();
      setVideoState({ isVisible: false, rect: null });
    };
  }, [playerMode, currentSong, setVideoState, duration]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(newSong)}`);
        const data = await res.json();
        if (Array.isArray(data)) setSearchResults(data);

      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (newSong.trim()) {
        fetchResults();
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [newSong]);

  const addToQueue = async (track: any) => {
    const songData = { 
      song_uri: track.uri, 
      song_title: track.title, 
      song_artist: track.artist, 
      song_image: track.image,
      added_by: 1 
    };
    try {
      await fetch(`/api/rooms/${id}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      setNewSong('');
      setSearchResults([]);
      setIsSearchOpen(false);
      channelRef.current?.send({ type: 'broadcast', event: 'queue_updated', payload: { roomId: id } });
    } catch (error) { console.error(error); }
  };

  const removeFromQueue = async (songId: number) => {
    try {
      await fetch(`/api/rooms/${id}/queue/${songId}`, {
        method: 'DELETE'
      });
      channelRef.current?.send({ type: 'broadcast', event: 'queue_updated', payload: { roomId: id } });
    } catch (error) { console.error(error); }
  };

  const handleVote = (songId: number, direction: 'up' | 'down') => {
    setQueue(prevQueue => prevQueue.map(song => {
      if (song.id === songId) {
        const newVotes = (song.votes || 0) + (direction === 'up' ? 1 : -1);
        return { ...song, votes: newVotes };
      }
      return song;
    }).sort((a, b) => (b.votes || 0) - (a.votes || 0)));
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msgData = { room_id: id, user_id: 1, content: chatInput, type: 'text' };
    try {
      const res = await fetch(`/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      const data = await res.json();
      setChatInput('');
      channelRef.current?.send({ type: 'broadcast', event: 'new_message', payload: { ...data, roomId: id } });
    } catch (error) { console.error(error); }
  };

  const sendReaction = (emoji: string) => {
    channelRef.current?.send({ type: 'broadcast', event: 'new_reaction', payload: { roomId: id, reaction: emoji, user: 1 } });
  };

  const startWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      setInVoice(true);
    } catch (err) {
      console.error('Failed to access microphone', err);
    }
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (!globalCurrentSong || globalCurrentSong.song_uri !== currentSong.song_uri) {
      playSong({ ...currentSong, room_id: id as string });
      channelRef.current?.send({ type: 'broadcast', event: 'playback_synced', payload: { roomId: id, state: 'play' } });
      return;
    }
    
    globalTogglePlay();
    channelRef.current?.send({ type: 'broadcast', event: 'playback_synced', payload: { roomId: id, state: !globalIsPlaying ? 'play' : 'pause' } });
  };

  const playNext = () => {
    if (currentSongIndex < queue.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    }
  };

  const playPrev = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (!currentSong) return;
    if (!globalCurrentSong || globalCurrentSong.song_uri !== currentSong.song_uri) {
      playSong({ ...currentSong, room_id: id as string });
    }
  }, [currentSongIndex, currentSong]);

  useEffect(() => {
    setOnEndedCallback(() => {
      playNext();
    });
  }, [currentSongIndex, queue]);

  const renderSongCard = (song: any, index: number, isPlaying: boolean, isTrending: boolean = false) => {
    const displayIndex = index >= 0 ? index + 1 : null;
    
    return (
      <Fragment key={song.id || `${song.song_uri}-${index}`}>
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={`group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors relative ${isPlaying ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-white/5'}`}
          onClick={() => {
            if (isTrending) {
              playSong({ ...song, room_id: id as string });
            } else if (index >= 0) {
              setCurrentSongIndex(index);
            }
          }}
        >
          {/* Index / Play / EQ */}
          <div className="w-6 flex justify-center shrink-0">
            {isPlaying ? (
              <div className="flex items-end justify-center gap-[2px] h-3.5 w-4 overflow-hidden">
                <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-primary rounded-t-sm" />
                <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-primary rounded-t-sm" />
                <motion.div animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-primary rounded-t-sm" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-full h-full">
                <span className={`text-xs font-medium text-muted-foreground group-hover:opacity-0 transition-opacity ${isTrending ? 'opacity-0' : 'opacity-100'}`}>
                  {displayIndex}
                </span>
                <Play className={`w-4 h-4 text-foreground fill-current absolute opacity-0 group-hover:opacity-100 transition-opacity ${isTrending ? 'group-hover:opacity-100 opacity-0' : ''}`} />
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-black/50 border border-white/5">
            {song.song_image ? (
              <img src={song.song_image} alt="Art" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-full h-full p-2 text-muted-foreground/50" />
            )}
          </div>

          {/* Title & Artist */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className={`text-sm font-medium truncate leading-tight ${isPlaying ? 'text-primary' : 'text-foreground group-hover:text-white transition-colors'}`}>
              {song.song_title}
            </h4>
            <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
              {song.song_artist}
            </p>
          </div>

          {/* Added By & Votes */}
          {!isTrending && (
            <div className="hidden sm:flex items-center gap-4 shrink-0 text-muted-foreground mr-2">
               <div className="flex items-center gap-1.5" title={`Added by ${MOCK_MEMBERS.find(m => m.id === (song.added_by || 1))?.name || 'User'}`}>
                 <Avatar className="w-5 h-5 border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                   <AvatarImage src={`https://i.pravatar.cc/150?u=${song.added_by || song.id}`} />
                   <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                 </Avatar>
               </div>
               
               <button 
                 className="flex items-center gap-1 text-[11px] font-semibold hover:text-green-400 transition-colors w-8 justify-end" 
                 onClick={(e) => { e.stopPropagation(); handleVote(song.id, 'up'); }}
               >
                 {song.votes || 0} <ChevronUp className="w-3 h-3" />
               </button>
            </div>
          )}

          {/* Duration & Actions */}
          <div className="flex items-center gap-3 shrink-0">
             <span className="text-[11px] text-muted-foreground font-medium w-8 text-right">
               {song.duration || '3:45'}
             </span>
             
             {/* Hover Actions */}
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-14 justify-end">
                {!isPlaying && !isTrending && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="w-6 h-6 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10">
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                )}
                {!isTrending && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFromQueue(song.id); }} className="w-6 h-6 text-muted-foreground hover:text-destructive rounded-full hover:bg-white/10">
                    <X className="w-3 h-3" />
                  </Button>
                )}
                {isTrending && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className="w-6 h-6 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10" title="Add to Queue">
                    <Play className="w-3 h-3" />
                  </Button>
                )}
             </div>
          </div>
        </motion.div>
      </Fragment>
    );
  };

  return (

    <div className="flex flex-col h-[calc(100vh-13rem)] md:h-[calc(100vh-14rem)] overflow-hidden relative w-full bg-background rounded-2xl shadow-2xl border border-white/5">
      
      {/* Floating Reactions */}
      {activeReactions.map(reaction => (
        <div key={reaction.id} className="absolute bottom-32 text-4xl z-[100] pointer-events-none" style={{ right: `\${reaction.right || 50}%`, animation: 'floatReaction 3s ease-out forwards' }}>
          {reaction.emoji}
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatReaction { 
          0% { opacity: 1; transform: translateY(0) scale(0.5) rotate(-10deg); } 
          50% { transform: translateY(-150px) scale(1.2) rotate(10deg); }
          100% { opacity: 0; transform: translateY(-300px) scale(1.5) rotate(-5deg); } 
        }
      `}} />

      {/* Dynamic Cinematic Background */}
      {currentSong?.song_image && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Blurred Artwork */}
          <div 
            className="absolute inset-0 opacity-50 blur-[100px] scale-150 transition-all duration-1000"
            style={{
              backgroundImage: `url(\${currentSong.song_image.replace('100x100', '1000x1000')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90" />
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />
        </div>
      )}

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col z-10 w-full max-w-[1800px] mx-auto min-h-0 pt-6 px-4 sm:px-6 lg:px-8">
        


        {/* Grid Row */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pb-6">
          
          {/* Left: Header, Video & Lyrics */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header Row */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{roomName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Private</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Users className="w-3.5 h-3.5" /> 12 Members</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Music className="w-3.5 h-3.5" /> 54 Songs</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Heart className="w-3.5 h-3.5 text-pink-500" /> 126 Likes</span>
                </div>
              </div>
            </header>

            {/* View Mode Toggle Header */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-3 mb-4 px-2">
              <button 
                onClick={() => setPlayerMode('video')} 
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${playerMode === 'video' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                suppressHydrationWarning
              >
                VIDEO
              </button>
              <button 
                onClick={() => setPlayerMode('lyrics')} 
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${playerMode === 'lyrics' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                suppressHydrationWarning
              >
                LYRICS
              </button>
            </div>
            
            <div className="w-full lg:w-[85%] mx-auto aspect-video relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black shrink-0 mb-6">
              
              {/* No Song State */}
              <div 
                className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center opacity-70 bg-muted/20 transition-opacity duration-500"
                style={{ opacity: !currentSong ? 1 : 0, pointerEvents: !currentSong ? 'auto' : 'none' }}
              >
                <div className="w-32 h-32 rounded-2xl mb-4 bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                  <Music className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h2 className="text-xl font-bold mb-2 tracking-tight">No song playing</h2>
                <p className="text-muted-foreground text-sm max-w-xs">Add a song to the queue to start listening.</p>
              </div>

              {/* Video Placeholder */}
              <div 
                ref={videoPlaceholderRef} 
                className="absolute inset-0 z-10 transition-opacity duration-500"
                style={{ 
                  opacity: currentSong && playerMode === 'video' ? 1 : 0,
                  pointerEvents: currentSong && playerMode === 'video' ? 'auto' : 'none'
                }}
              ></div>

              {/* Lyrics Container */}
              <div 
                className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center overflow-hidden bg-black/80 backdrop-blur-3xl transition-opacity duration-500"
                style={{ 
                  opacity: currentSong && playerMode === 'lyrics' ? 1 : 0,
                  pointerEvents: currentSong && playerMode === 'lyrics' ? 'auto' : 'none'
                }}
              >
                <motion.div 
                  animate={{ y: `calc(50% - ${Math.max(0, [0, 5, 10, 15, 20, 25, 30, 35, 40].findIndex(t => progress >= t && progress < t+5)) * 64}px)` }} 
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="flex flex-col gap-8 absolute top-0 w-full pt-[275px]"
                >
                  {[
                    { time: 0, text: "♪" },
                    { time: 5, text: "Yesterday" },
                    { time: 10, text: "All my troubles seemed so far away" },
                    { time: 15, text: "Now it looks as though they're here to stay" },
                    { time: 20, text: "Oh, I believe in yesterday" },
                    { time: 25, text: "Suddenly" },
                    { time: 30, text: "I'm not half the man I used to be" },
                    { time: 35, text: "There's a shadow hanging over me" },
                    { time: 40, text: "♪" }
                  ].map((line, i) => {
                    const activeLyricIndex = Math.max(0, [0, 5, 10, 15, 20, 25, 30, 35, 40].findIndex(t => progress >= t && progress < t+5));
                    const isPast = i < activeLyricIndex;
                    const isActive = i === activeLyricIndex;
                    return (
                      <p 
                        key={i} 
                        className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-700 h-[32px] flex items-center justify-center ${
                          isActive ? 'text-white scale-110 opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 
                          isPast ? 'text-white/30 scale-90 blur-[1px]' : 'text-white/40 scale-95'
                        }`}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Room Activity & Details - Below Video */}
            <div className="flex-1 min-h-0 overflow-y-auto w-full lg:w-[85%] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 pr-2">
                
                {/* Up Next Preview */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 transition-all hover:bg-black/30 hover:border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4"/> Up Next</h3>
                  <div className="space-y-2">
                    {queue.length > currentSongIndex + 1 ? (
                      queue.slice(currentSongIndex + 1, currentSongIndex + 3).map((song, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-white/5 border border-white/5">
                             {song.song_image ? <img src={song.song_image} className="w-full h-full object-cover" /> : <Music className="w-full h-full p-2 opacity-50" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate text-foreground">{song.song_title}</p>
                            <p className="text-xs text-muted-foreground truncate">{song.song_artist}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming songs.</p>
                    )}
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col transition-all hover:bg-black/30 hover:border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Chat Preview</h3>
                  <div className="flex-1 flex flex-col justify-end space-y-2">
                    {messages.slice(-2).map((msg, idx) => (
                      <div key={idx} className="text-sm leading-relaxed">
                        <span className="font-bold text-primary/90 mr-2">{msg.user_name || 'User'}:</span>
                        <span className="text-foreground/80">{msg.content}</span>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-sm text-muted-foreground">No recent messages.</p>}
                  </div>
                </div>

                {/* Room Activity */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 transition-all hover:bg-black/30 hover:border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> Room Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground/80 bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> <span className="font-medium text-white">Alex Johnson</span> joined the room
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/80 bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div> <span className="font-medium text-white">Sarah Chen</span> added a song
                    </div>
                  </div>
                </div>

                {/* Recent Reactions */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 transition-all hover:bg-black/30 hover:border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500"/> Recent Reactions</h3>
                  <div className="flex gap-4 pt-1">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl animate-bounce shadow-xl border border-white/10 backdrop-blur-md">🔥</div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl animate-bounce shadow-xl border border-white/10 backdrop-blur-md" style={{ animationDelay: '0.2s' }}>❤️</div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl animate-bounce shadow-xl border border-white/10 backdrop-blur-md" style={{ animationDelay: '0.4s' }}>🎉</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right: Sidebar Container */}
          <div className="w-full lg:w-[35%] h-full shrink-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl" style={{ background: 'rgba(15,15,20,0.55)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            
            {/* Reactions and Voice Controls */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20">
              {/* Reaction Buttons */}
              <div className="flex items-center gap-1 bg-background/40 backdrop-blur-md rounded-full px-2 py-1 border border-border/30">
                {[{icon: Heart, emoji: '❤️'}, {icon: Flame, emoji: '🔥'}, {icon: Laugh, emoji: '😂'}, {icon: PartyPopper, emoji: '🎉'}].map(({icon: Icon, emoji}) => (
                  <Button key={emoji} variant="ghost" size="icon" onClick={() => sendReaction(emoji)} className="w-8 h-8 rounded-full hover:bg-accent/80 hover:scale-110 transition-all text-lg">
                    {emoji}
                  </Button>
                ))}
              </div>

              {!inVoice ? (
                <Button onClick={() => startWebRTC()} variant="outline" className="text-primary border-primary/50 hover:bg-primary/10 rounded-full px-6 shadow-md h-9">
                  <Mic className="w-4 h-4 mr-2" /> Join Voice
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} className="min-w-[90px] rounded-full h-9 text-xs">
                    {isMuted ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  <div className="flex items-center gap-2 text-green-500 font-medium text-xs bg-green-500/10 px-2 py-1.5 rounded-full shadow-inner border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                </div>
              )}
              <audio ref={localAudioRef} autoPlay muted className="hidden" />
              <audio ref={remoteAudioRef} autoPlay className="hidden" />
            </div>

            <Tabs defaultValue="queue" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col w-full min-h-0">
              <div className="p-0 border-b border-white/10 bg-black/20 relative">
                <TabsList className="w-full bg-transparent p-0 h-14 rounded-none border-b-0 flex">
                  <TabsTrigger value="queue" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold">Queue</TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold">Live Chat</TabsTrigger>
                  <TabsTrigger value="members" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold">Members</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="queue" className="flex-1 w-full p-0 m-0 outline-none min-h-0">
                <div className="h-full flex flex-col overflow-hidden">
                  <div className="p-4 pb-0 z-10 shrink-0">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-muted-foreground border-white/10 bg-black/20 hover:bg-white/5 hover:text-white rounded-xl h-10 shadow-sm transition-all"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="w-4 h-4 mr-2 opacity-70" />
                    Search for songs to add to queue...
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {queue.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70 my-8">
                      <Music className="w-10 h-10 mb-3 opacity-50" />
                      <p className="font-medium">The queue is empty.</p>
                    </div>
                  )}
                  
                  {/* NOW PLAYING */}
                  {currentSong ? (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase flex items-center gap-2 px-1 mb-1">
                        <Activity className="w-3.5 h-3.5" /> Now Playing
                      </h3>
                      {renderSongCard(currentSong, currentSongIndex, true)}
                    </div>
                  ) : null}

                  {/* NEXT UP */}
                  {queue.length > currentSongIndex + 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 px-1 mb-1">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center gap-2 shrink-0">
                          <Clock className="w-3.5 h-3.5" /> Up Next
                        </h3>
                        <div className="h-px bg-white/10 flex-1"></div>
                      </div>
                      <div className="space-y-0.5">
                        {queue.slice(currentSongIndex + 1).map((song, index) => (
                          renderSongCard(song, currentSongIndex + 1 + index, false)
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TRENDING */}
                  {trendingSongs && trendingSongs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-4 px-1 mb-1">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-orange-400 uppercase flex items-center gap-2 shrink-0">
                          <Flame className="w-3.5 h-3.5" /> Trending
                        </h3>
                        <div className="h-px bg-white/10 flex-1"></div>
                      </div>
                      <div className="space-y-0.5">
                        {trendingSongs.map((song, index) => (
                          renderSongCard(song, -1, false, true)
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HISTORY */}
                  {currentSongIndex > 0 && (
                    <div className="space-y-2 pt-2 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4 px-1 mb-1">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center gap-2 shrink-0">
                          <History className="w-3.5 h-3.5" /> History
                        </h3>
                        <div className="h-px bg-white/10 flex-1"></div>
                      </div>
                      <div className="space-y-0.5 grayscale hover:grayscale-0 transition-all">
                        {queue.slice(0, currentSongIndex).reverse().map((song, index) => (
                          renderSongCard(song, currentSongIndex - 1 - index, false)
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 w-full p-0 m-0 outline-none min-h-0">
                <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70">
                      <p className="font-medium">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.user_id === 1;
                      return (
                        <div key={idx} className={`flex flex-col \${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-muted-foreground mb-1 px-1 font-medium tracking-wide">{msg.user_name || 'User'}</span>
                          <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm \${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-black/40 text-foreground rounded-bl-sm border border-white/5'}`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md relative">
                  {showEmojiPicker && (
                    <div className="absolute bottom-[calc(100%+12px)] left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border/50">
                      <EmojiPicker onEmojiClick={(e) => setChatInput(prev => prev + e.emoji)} theme={'dark' as any} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`shrink-0 rounded-full h-10 w-10 border-white/10 bg-black/40 \${showEmojiPicker ? 'bg-white/10' : ''}`}
                    >
                      <Smile className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                      className="flex-1 bg-black/40 border-white/10 rounded-full h-10"
                    />
                    <Button onClick={sendMessage} size="icon" className="shrink-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground border-none" disabled={!chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="flex-1 w-full p-0 m-0 outline-none min-h-0">
                <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2">Active Members - {MOCK_MEMBERS.length}</h3>
                  {MOCK_MEMBERS.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors shadow-sm">
                      <div className="relative">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        {member.isSpeaking && (
                           <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{member.name}</p>
                        <p className="text-xs text-primary font-medium">{member.role}</p>
                      </div>
                      <div className="shrink-0">
                        {member.isSpeaking ? (
                          <div className="bg-green-500/10 p-2 rounded-full">
                             <Mic className="w-4 h-4 text-green-500 animate-pulse" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-full opacity-50">
                             <MicOff className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-white/10">
          <SheetHeader className="p-4 border-b border-white/10 text-left bg-black/40">
            <SheetTitle className="text-lg font-bold">Search Songs</SheetTitle>
          </SheetHeader>
          <div className="p-4 pb-2 border-b border-white/10 bg-black/20">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Type a song, artist, or album..." 
                value={newSong} 
                onChange={handleSearchChange} 
                className="pl-9 bg-black/40 rounded-full h-10 border-white/10 focus-visible:ring-primary shadow-inner"
                autoFocus
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isSearching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-white/5 bg-black/20">
                  <Skeleton className="w-16 h-16 rounded-md shrink-0 bg-primary/10" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4 bg-primary/10" />
                    <Skeleton className="h-3 w-1/2 bg-primary/10" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-3 w-12 bg-primary/10" />
                      <Skeleton className="h-3 w-12 bg-primary/10" />
                    </div>
                  </div>
                </div>
              ))
            ) : searchResults.length > 0 ? (
              searchResults.map(track => (
                <div key={track.id} onClick={() => addToQueue(track)} className="flex gap-4 items-center p-3 rounded-xl cursor-pointer bg-black/20 hover:bg-white/5 transition-colors group border border-white/5 hover:border-primary/30 shadow-sm">
                  {track.image ? (
                    <img src={track.image} alt="Art" className="w-16 h-16 rounded-md shadow-sm object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0"><Music className="w-6 h-6 text-muted-foreground" /></div>
                  )}
                  <div className="overflow-hidden flex-1 flex flex-col justify-center h-16 py-0.5">
                    <div>
                      <p className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">{track.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{track.artist} {track.album ? `• \${track.album}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground mt-1">
                      {track.duration && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {track.duration}</span>
                      )}
                      {track.popularity && (
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {track.popularity.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="shrink-0 text-xs font-bold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                    Add
                  </Button>
                </div>
              ))
            ) : newSong.trim() ? (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">No results found.</p>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                <Library className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">Type to search for songs.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

