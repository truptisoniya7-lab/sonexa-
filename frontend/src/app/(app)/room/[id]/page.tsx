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
import { Mic, MicOff, Play, Pause, SkipForward, SkipBack, Smile, Send, Search, X, Heart, Flame, Music, Laugh, PartyPopper, ChevronUp, ChevronDown, User, Activity, Clock, Eye, Library, MoreHorizontal } from 'lucide-react';
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
  const { playSong, togglePlay: globalTogglePlay, isPlaying: globalIsPlaying, currentSong: globalCurrentSong, setOnEndedCallback, progress, duration, seekTo } = usePlayer();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}`)
      .then(res => res.json())
      .then(data => setRoomName(data.name))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}/queue`)
      .then(res => res.json())
      .then(data => {
        // Add mock votes if missing
        const queueWithVotes = data.map((item: any) => ({ ...item, votes: Math.floor(Math.random() * 5) }));
        setQueue(queueWithVotes);
      })
      .catch(console.error);
      
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/messages/${id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/spotify/trending`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTrendingSongs(data); })
      .catch(console.error);

    const channel = supabase.channel(`room:${id}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'queue_updated' }, () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}/queue`)
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
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/spotify/search?q=${encodeURIComponent(newSong)}`);
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      setNewSong('');
      setSearchResults([]);
      channelRef.current?.send({ type: 'broadcast', event: 'queue_updated', payload: { roomId: id } });
    } catch (error) { console.error(error); }
  };

  const removeFromQueue = async (songId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}/queue/${songId}`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/messages`, {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative min-h-[85vh] pb-12">
      
      {/* Floating Reactions */}
      {activeReactions.map(reaction => (
        <div key={reaction.id} className="absolute bottom-24 text-4xl z-50 pointer-events-none" style={{ right: `${reaction.right || 50}%`, animation: 'floatReaction 3s ease-out forwards' }}>
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

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{roomName}</h1>
          <p className="text-muted-foreground">Listen and chat together in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          {!inVoice ? (
            <Button onClick={() => startWebRTC()} variant="outline" className="text-primary border-primary/50 hover:bg-primary/10 rounded-full px-6 shadow-md">
              <Mic className="w-4 h-4 mr-2" /> Join Voice
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} className="min-w-[100px] rounded-full">
                {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <div className="flex items-center gap-2 text-green-500 font-medium text-sm bg-green-500/10 px-4 py-2 rounded-full shadow-inner border border-green-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Voice Active
              </div>
            </div>
          )}
          <audio ref={localAudioRef} autoPlay muted className="hidden" />
          <audio ref={remoteAudioRef} autoPlay className="hidden" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px] lg:h-[750px]">
        {/* Main Player Area */}
        <Card className="glass-panel lg:col-span-2 relative overflow-hidden flex flex-col items-center justify-center border-primary/10 shadow-2xl">
          {currentSong?.song_image && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 blur-[100px] pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${currentSong.song_image})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background pointer-events-none z-0" />
          
          {currentSong ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentSong.song_uri}
              className="flex flex-col items-center z-10 w-full max-w-lg px-6"
            >
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-2xl mb-6 shadow-2xl overflow-hidden group border border-border/30">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {currentSong.song_image ? (
                  <img src={currentSong.song_image.replace('100x100', '500x500')} alt="Album Art" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Music className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Now Playing Indicator Overlay */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                  {globalIsPlaying && globalCurrentSong?.song_uri === currentSong.song_uri ? (
                    <div className="flex items-end justify-center gap-[2px] h-3 w-4 overflow-hidden">
                      <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-primary rounded-t-sm" />
                      <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-primary rounded-t-sm" />
                      <motion.div animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-primary rounded-t-sm" />
                    </div>
                  ) : (
                    <Activity className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-xs font-semibold text-white tracking-wider uppercase">Now Playing</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 text-center line-clamp-1 tracking-tight text-foreground">{currentSong.song_title}</h2>
              <p className="text-muted-foreground mb-6 text-center text-lg font-medium">{currentSong.song_artist}</p>

              {/* Progress Bar */}
              <div className="w-full max-w-md mb-6 relative">
                <Slider 
                  value={[progress]} 
                  max={duration || 100} 
                  step={1}
                  onValueChange={(val) => seekTo(val[0])}
                  className="cursor-pointer mb-2"
                />
                <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium px-1 tracking-widest uppercase">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 bg-background/30 backdrop-blur-xl px-8 py-4 rounded-full border border-border/30 shadow-xl mb-6">
                <Button variant="ghost" size="icon" onClick={playPrev} disabled={currentSongIndex === 0} className="w-12 h-12 rounded-full hover:bg-primary/20 text-foreground transition-transform hover:scale-105">
                  <SkipBack className="w-6 h-6 fill-current" />
                </Button>
                <Button onClick={togglePlay} size="icon" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background">
                  {(globalCurrentSong?.song_uri === currentSong.song_uri && globalIsPlaying) ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext} disabled={currentSongIndex >= queue.length - 1} className="w-12 h-12 rounded-full hover:bg-primary/20 text-foreground transition-transform hover:scale-105">
                  <SkipForward className="w-6 h-6 fill-current" />
                </Button>
              </div>

              {/* Lyrics Preview Placeholder */}
              <div className="w-full max-w-md h-[72px] relative overflow-hidden rounded-xl flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm border border-border/20 shadow-inner">
                <motion.div 
                  animate={{ y: ["0%", "-50%"] }} 
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="flex flex-col items-center gap-2 text-center opacity-50 blur-[0.5px]"
                >
                  <p className="text-lg font-bold text-white tracking-wide">♪ You know I want you ♪</p>
                  <p className="text-lg font-bold text-white tracking-wide">♪ It's not a secret I try to hide ♪</p>
                  <p className="text-lg font-bold text-white tracking-wide">♪ I know you want me ♪</p>
                  <p className="text-lg font-bold text-white tracking-wide">♪ So don't keep saying our hands are tied ♪</p>
                  <p className="text-lg font-bold text-white tracking-wide">♪ You claim it's not in the cards ♪</p>
                  <p className="text-lg font-bold text-white tracking-wide">♪ But fate is pulling you miles away ♪</p>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-background/90 pointer-events-none" />
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-center z-10 opacity-70">
              <div className="w-72 h-72 rounded-2xl mb-8 bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                <Music className="w-20 h-20 text-muted-foreground/50" />
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">No song playing</h2>
              <p className="text-muted-foreground max-w-sm text-lg">Add a song to the queue to start listening together.</p>
            </div>
          )}

          {/* Reaction Bar */}
          <div className="absolute top-6 right-6 bg-background/60 backdrop-blur-xl p-2 rounded-full border border-border/50 shadow-2xl flex flex-col gap-3 z-20">
            {[{icon: Heart, emoji: '❤️'}, {icon: Flame, emoji: '🔥'}, {icon: Laugh, emoji: '😂'}, {icon: PartyPopper, emoji: '🎉'}].map(({icon: Icon, emoji}) => (
              <Button key={emoji} variant="ghost" size="icon" onClick={() => sendReaction(emoji)} className="w-12 h-12 rounded-full hover:bg-accent/80 hover:scale-110 transition-all text-2xl">
                {emoji}
              </Button>
            ))}
          </div>
        </Card>

        {/* Sidebar: Queue, Chat, Members */}
        <Card className="glass-panel flex flex-col overflow-hidden h-full shadow-2xl border-primary/10">
          <Tabs defaultValue="queue" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col h-full w-full">
            <CardHeader className="p-0 border-b border-border/50 bg-background/40">
              <TabsList className="w-full bg-transparent p-0 h-14 rounded-none border-b-0 flex">
                <TabsTrigger value="queue" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold">Queue</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold">Live Chat</TabsTrigger>
                <TabsTrigger value="members" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold">Members</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <TabsContent value="queue" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {queue.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70 my-8">
                    <Music className="w-10 h-10 mb-3 opacity-50" />
                    <p className="font-medium">The queue is empty.</p>
                  </div>
                )}
                
                <AnimatePresence>
                  {queue.map((song, index) => {
                    const isPlaying = index === currentSongIndex;
                    const isUpNextFirst = index === currentSongIndex + 1;
                    return (
                    <Fragment key={song.id}>
                      {isPlaying && (
                        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur py-2 mb-2 border-b border-border/50 -mx-4 px-4">
                          <h3 className="text-xs font-bold tracking-widest text-primary uppercase flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Now Playing
                          </h3>
                        </div>
                      )}
                      {isUpNextFirst && (
                        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur py-2 mb-2 mt-4 border-b border-border/50 -mx-4 px-4">
                          <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Up Next
                          </h3>
                        </div>
                      )}
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-all duration-200 group shadow-sm border hover:-translate-y-0.5 hover:shadow-md hover:bg-accent/30 ${isPlaying ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)] relative overflow-hidden' : 'bg-background/40 border-border/30 hover:brightness-110'}`}
                      >
                        {isPlaying && (
                          <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
                        )}
                        <div onClick={() => setCurrentSongIndex(index)} className="w-6 flex justify-center shrink-0 z-10">
                          {isPlaying ? (
                            <div className="flex items-end justify-center gap-[2px] h-3 w-4 overflow-hidden">
                              <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-primary rounded-t-sm" />
                              <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-primary rounded-t-sm" />
                              <motion.div animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-primary rounded-t-sm" />
                            </div>
                          ) : (
                            <span className="font-medium text-xs text-muted-foreground group-hover:hidden">{index + 1}</span>
                          )}
                          {!isPlaying && <Play className="w-3 h-3 text-primary hidden group-hover:block fill-current" />}
                        </div>
                        
                        <div className="relative z-10 shrink-0">
                          {song.song_image ? (
                            <img src={song.song_image} alt="Art" className={`w-10 h-10 rounded-lg object-cover shadow-sm transition-transform ${isPlaying ? 'scale-105 ring-1 ring-primary/50' : ''}`} onClick={() => setCurrentSongIndex(index)} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Music className="w-4 h-4 text-muted-foreground" /></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 z-10 flex flex-col justify-center" onClick={() => setCurrentSongIndex(index)}>
                          <p className={`text-[13px] font-bold truncate leading-tight ${isPlaying ? 'text-primary' : ''}`}>{song.song_title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{song.song_artist}</p>
                        </div>
                        
                        {/* Duration & Added By */}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0 z-10 mr-2 opacity-100 transition-opacity">
                          <span className="hidden sm:inline-block">{song.duration || '3:45'}</span>
                          <Avatar className="w-5 h-5 border border-border">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${song.added_by || song.id}`} />
                            <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Hover Actions (Heart, More, X) */}
                        <div className="absolute right-[44px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shrink-0 bg-background/80 backdrop-blur-md rounded-lg p-1 border border-border/50 shadow-md">
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10"><Heart className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary hover:bg-primary/10"><MoreHorizontal className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFromQueue(song.id); }} className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><X className="w-4 h-4" /></Button>
                        </div>
                        
                        {/* Voting Section (Always Visible) */}
                        <div className="flex flex-col items-center gap-0.5 bg-background border border-border/50 shadow-sm rounded-md px-1.5 py-0.5 min-w-[32px] z-10 ml-1">
                          <button onClick={(e) => { e.stopPropagation(); handleVote(song.id, 'up'); }} className="hover:bg-accent rounded-sm transition-colors"><ChevronUp className="w-3.5 h-3.5 text-green-500 hover:text-green-400" /></button>
                          <span className="text-[10px] font-bold leading-none">{song.votes || 0}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleVote(song.id, 'down'); }} className="hover:bg-accent rounded-sm transition-colors"><ChevronDown className="w-3.5 h-3.5 text-red-500 hover:text-red-400" /></button>
                        </div>
                      </motion.div>
                    </Fragment>
                    );
                  })}
                </AnimatePresence>

                {queue.length < 3 && trendingSongs.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" /> Recommended For You
                    </h4>
                    <div className="space-y-2">
                      {trendingSongs.map(song => (
                        <div key={song.id} className="flex items-center gap-3 p-2 rounded-xl bg-background/40 hover:bg-accent/50 border border-border/30 transition-colors group cursor-pointer" onClick={() => addToQueue(song)}>
                          {song.image ? (
                            <img src={song.image} alt="Art" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Music className="w-4 h-4 text-muted-foreground" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{song.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{song.artist}</p>
                          </div>
                          <Button variant="secondary" size="sm" className="shrink-0 text-[10px] font-bold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100">
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-md relative">
                <Button 
                  onClick={() => setIsSearchOpen(true)} 
                  variant="outline" 
                  className="w-full justify-start text-muted-foreground bg-background rounded-full h-10 border-primary/20 shadow-inner hover:bg-accent/50 transition-colors"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search songs to add...
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70">
                    <p className="font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.user_id === 1;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-muted-foreground mb-1 px-1 font-medium tracking-wide">{msg.user_name || 'User'}</span>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-accent/80 text-accent-foreground rounded-bl-sm border border-border/50'}`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-md relative">
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
                    className={`shrink-0 rounded-full h-10 w-10 ${showEmojiPicker ? 'bg-accent' : ''}`}
                  >
                    <Smile className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                    className="flex-1 bg-background rounded-full h-10"
                  />
                  <Button onClick={sendMessage} size="icon" className="shrink-0 rounded-full h-10 w-10" disabled={!chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2">Active Members - {MOCK_MEMBERS.length}</h3>
                {MOCK_MEMBERS.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 hover:bg-accent/50 border border-border/30 transition-colors shadow-sm">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border border-border">
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
            </TabsContent>

          </Tabs>
        </Card>
      </div>

      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/50">
          <SheetHeader className="p-4 border-b border-border/50 text-left">
            <SheetTitle className="text-lg font-bold">Search Songs</SheetTitle>
          </SheetHeader>
          <div className="p-4 pb-2 border-b border-border/50 bg-background/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Type a song, artist, or album..." 
                value={newSong} 
                onChange={handleSearchChange} 
                className="pl-9 bg-background rounded-full h-10 border-primary/20 focus-visible:ring-primary shadow-inner"
                autoFocus
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isSearching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-border/30 bg-background/40">
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
                <div key={track.id} onClick={() => addToQueue(track)} className="flex gap-4 items-center p-3 rounded-xl cursor-pointer bg-background/40 hover:bg-accent/50 transition-colors group border border-border/30 hover:border-primary/30 shadow-sm">
                  {track.image ? (
                    <img src={track.image} alt="Art" className="w-16 h-16 rounded-md shadow-sm object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0"><Music className="w-6 h-6 text-muted-foreground" /></div>
                  )}
                  <div className="overflow-hidden flex-1 flex flex-col justify-center h-16 py-0.5">
                    <div>
                      <p className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">{track.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{track.artist} {track.album ? `• ${track.album}` : ''}</p>
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
