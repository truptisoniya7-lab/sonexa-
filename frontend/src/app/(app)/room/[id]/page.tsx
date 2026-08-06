'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Lock, Users, Music, Heart, Clock, MessageSquare, Activity } from 'lucide-react';

// Modular Components
import { ReactionOverlay } from '@/components/room/ReactionOverlay';
import { MembersPanel } from '@/components/room/MembersPanel';
import { ChatPanel } from '@/components/room/ChatPanel';
import { ActivityFeed } from '@/components/room/ActivityFeed';
import { VoicePanel } from '@/components/room/VoicePanel';
import { NowPlayingCinematic } from '@/components/room/NowPlayingCinematic';
import { QueuePanel } from '@/components/room/QueuePanel';
import { RoomCanvas } from '@/components/room/3d/RoomCanvas';
import { useDynamicTheme } from '@/components/room/hooks/useDynamicTheme';

// Context Hook
import { useRoomContext } from '@/context/RoomContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function RoomPage() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const autoplay = searchParams?.get('autoplay');

  // Room State from Provider
  const { session, provider, joinRoom, leaveRoom } = useRoomContext();
  
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);

  useEffect(() => {
    // If not in this room, and we are connected to another room, prompt switch
    if (session && session.connectionStatus !== 'disconnected' && session.roomId !== id) {
      setShowSwitchPrompt(true);
    } else {
      joinRoom(id);
    }
  }, [id, session?.roomId, session?.connectionStatus]);

  const confirmSwitch = () => {
    setShowSwitchPrompt(false);
    joinRoom(id);
  };

  const cancelSwitch = () => {
    setShowSwitchPrompt(false);
    // User stays in current room, we might want to redirect them back or just leave them on this page but disconnected?
    // Usually they'd be redirected back to the room they are in, or Home.
    if (session?.roomId) {
      window.location.href = `/room/${session.roomId}`;
    } else {
      window.location.href = '/discover';
    }
  };

  // Provide defaults while loading
  const members = session?.members || [];
  const queue = session?.queue || [];
  const messages = provider ? provider.getInitialState().messages : [];
  const reactions: any[] = [];
  const activities: any[] = [];
  const typingUsers: number[] = [];

  // Room State
  const [roomName, setRoomName] = useState('Community Room');
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'members'>('queue');
  
  // Search State
  const [newSong, setNewSong] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Playback & Voice State
  const { playSong, togglePlay: globalTogglePlay, isPlaying: globalIsPlaying, currentSong: globalCurrentSong, progress, duration } = usePlayer();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerMode, setPlayerMode] = useState<'artwork' | 'lyrics'>('artwork');
  const currentSong = queue[currentSongIndex] || globalCurrentSong;
  
  // Dynamic Theme
  const theme = useDynamicTheme(currentSong?.song_image);

  // WebRTC State
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`/api/rooms/${id}`)
      .then(res => { 
        if (!res.ok) return { name: `Room ${id}` };
        return res.json(); 
      })
      .then(data => { if (data.name) setRoomName(data.name); })
      .catch(err => { setRoomName(`Room ${id}`); });
  }, [id]);

  useEffect(() => {
    if (!currentSong) {
      fetch(`/api/music/discover?section=trending`)
        .then(res => res.ok ? res.json() : [])
        .then(data => { 
          if (Array.isArray(data)) {
             const mapped = data.map(s => ({
               ...s,
               song_uri: s.uri || s.song_uri,
               song_title: s.title || s.song_title,
               song_artist: s.artist || s.song_artist,
               song_image: s.image || s.song_image
             }));
             setRecommendedSongs(mapped.slice(0, 5));
          }
        })
        .catch(() => setRecommendedSongs([]));
      return;
    }

    const query = `more songs like ${currentSong.song_title} by ${currentSong.song_artist || 'various artists'}`;
    fetch(`/api/music/search?q=${encodeURIComponent(query)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { 
        let songs = Array.isArray(data) ? data : (data.songs || []);
        songs = songs.filter((s: any) => s.title !== currentSong.song_title);
        const mapped = songs.map((s: any) => ({
          ...s,
          song_uri: s.uri || s.id,
          song_title: s.title,
          song_artist: s.artist,
          song_image: s.image || s.thumbnail
        }));
        setRecommendedSongs(mapped.slice(0, 5));
      })
      .catch(() => setRecommendedSongs([]));
  }, [currentSong?.song_uri]);

  useEffect(() => {
    // Autoplay logic if queue populates and we haven't played
    if (autoplay === 'true' && queue.length > 0 && !globalIsPlaying && currentSongIndex === 0) {
      const firstSong = queue[0];
      if (globalCurrentSong?.song_uri !== firstSong.song_uri) {
        playSong({
          song_uri: firstSong.song_uri,
          song_title: firstSong.song_title,
          song_artist: firstSong.song_artist,
          song_image: firstSong.song_image,
          room_id: id as string
        } as any);
      }
    }
  }, [queue, autoplay, globalIsPlaying, currentSongIndex, globalCurrentSong, playSong, id]);

  // (setVideoState removed)

  useEffect(() => {
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(newSong)}`);
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) setSearchResults(data);
      } catch (error) { console.error(error); } finally { setIsSearching(false); }
    };
    const debounceTimer = setTimeout(() => {
      if (newSong.trim()) fetchResults();
      else { setSearchResults([]); setIsSearching(false); }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [newSong]);

  const addToQueue = async (track: any) => {
    const uri = track.uri || track.song_uri;
    const title = track.title || track.song_title;
    const artist = track.artist || track.song_artist;
    const image = track.image || track.song_image;
    const songData = { song_uri: uri, song_title: title, song_artist: artist, song_image: image };
    
    if (queue.length === 0) {
      playSong({ ...songData, room_id: id as string } as any);
      setTimeout(() => setCurrentSongIndex(0), 500);
    }
    
    await provider?.addSong(songData);
    setNewSong('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const playNow = async (track: any) => {
    const uri = track.uri || track.song_uri;
    const title = track.title || track.song_title;
    const artist = track.artist || track.song_artist;
    const image = track.image || track.song_image;
    const songData = { song_uri: uri, song_title: title, song_artist: artist, song_image: image };
    
    playSong({ ...songData, room_id: id as string } as any);
    await provider?.addSong(songData);
    
    // We let the provider's queue sync update the queue, then we'll jump to the end
    setTimeout(() => {
      setCurrentSongIndex(queue.length);
    }, 500);

    setNewSong('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const removeFromQueue = async (songId: number) => {
    try {
      await provider?.removeSong(songId.toString());
    } catch (error) { console.error(error); }
  };

  const handleVote = (songId: number, direction: 'up' | 'down') => {
    provider?.voteSong(songId.toString(), direction);
  };

  const handleSendMessage = (content: string) => {
    provider?.sendMessage(content);
  };

  const sendReaction = (emoji: string) => {
    provider?.sendReaction(emoji);
  };

  useEffect(() => {
    if (!currentSong) return;
    if (!globalCurrentSong || globalCurrentSong.song_uri !== currentSong.song_uri) {
      playSong({ ...currentSong, room_id: id as string } as any);
    }
  }, [currentSongIndex, currentSong, globalCurrentSong, playSong, id]);

  // (setOnEndedCallback removed since it's not in PlayerContext yet)

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] md:h-[calc(100vh-14rem)] overflow-hidden relative w-full rounded-2xl shadow-2xl border border-white/5" style={{ backgroundColor: theme.dark }}>
      
      <ReactionOverlay reactions={reactions} />
      
      {/* 3D Music Universe Layer */}
      <RoomCanvas currentSong={currentSong} isPlaying={globalIsPlaying} theme={theme} members={members} />

      {/* Main Content Area Container - Glassmorphism Overlay */}
      <div className="flex-1 flex flex-col z-10 w-full max-w-[1800px] mx-auto min-h-0 pt-6 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pb-6">
          
          {/* Left: Header & Activity */}
          <div className="flex-1 flex flex-col min-w-0 justify-between">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0 pointer-events-auto">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{roomName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Private</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Users className="w-3.5 h-3.5" /> {members.length} Members</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Music className="w-3.5 h-3.5" /> {queue.length} Songs</span>
                </div>
              </div>
            </header>

              <div className="flex items-center gap-6 border-b border-white/10 pb-3 mb-4 px-2 pointer-events-auto">
                {/* We removed NowPlayingCinematic as the 3D scene handles the visuals now */}
              </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full lg:w-[85%] mx-auto">
              <div className="flex flex-col gap-6 pb-6 pr-2">
                
                {/* NOW PLAYING DASHBOARD */}
                <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col transition-all hover:bg-white/[0.12] pointer-events-auto relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Music className="w-32 h-32" />
                  </div>
                  
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5"/> Now Playing
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <img 
                      src={currentSong?.song_image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300'} 
                      alt="Album Art" 
                      className="w-32 h-32 rounded-xl object-cover shadow-2xl border border-white/10" 
                    />
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white line-clamp-1">{currentSong?.song_title || 'Waiting for DJ'}</h2>
                        <p className="text-lg font-medium text-white/70 line-clamp-1">{currentSong?.song_artist || 'Silence'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Duration</p>
                          <p className="text-sm font-medium text-white">{currentSong?.duration || '3:45'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Genre</p>
                          <p className="text-sm font-medium text-white">{currentSong?.genre || 'Electronic'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Mood</p>
                          <p className="text-sm font-medium text-white capitalize">{currentSong?.mood || 'Vibing'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Likes</p>
                          <p className="text-sm font-medium text-white flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500 fill-pink-500"/> {currentSong?.likes || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* COMPACT CHAT PREVIEW */}
                  <div className="bg-white/[0.06] backdrop-blur-2xl rounded-2xl p-4 border border-white/[0.08] flex flex-col pointer-events-auto h-40">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5"/> Live Chat
                    </h3>
                    <div className="flex-1 flex flex-col justify-end space-y-2 overflow-hidden">
                      {messages.slice(-2).map((msg, idx) => (
                        <div key={idx} className="text-xs leading-relaxed truncate">
                          <span className="font-bold text-primary mr-1">{msg.user_name}:</span>
                          <span className="text-white/80">{msg.content}</span>
                        </div>
                      ))}
                      {messages.length === 0 && <p className="text-xs text-white/40 italic">Quiet in here...</p>}
                    </div>
                  </div>

                  <ActivityFeed activities={activities} />
                </div>

              </div>
            </div>
          </div>

          {/* Right: Sidebar Container */}
          <div className="w-full lg:w-[35%] h-full shrink-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl pointer-events-auto bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08]">
            
            <VoicePanel 
              inVoice={inVoice} 
              isMuted={isMuted} 
              onJoinVoice={() => setInVoice(true)} 
              onToggleMute={() => setIsMuted(!isMuted)} 
              onSendReaction={sendReaction} 
              localAudioRef={localAudioRef as React.RefObject<HTMLAudioElement>} 
              remoteAudioRef={remoteAudioRef as React.RefObject<HTMLAudioElement>} 
            />

            <Tabs defaultValue="queue" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col w-full min-h-0">
              <div className="p-0 border-b border-white/[0.08] bg-white/[0.02] relative">
                <TabsList className="w-full bg-transparent p-0 h-14 rounded-none border-b-0 flex">
                  <TabsTrigger value="queue" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold text-white/60 data-[state=active]:text-white transition-colors flex flex-col justify-center">
                    <span>Queue</span>
                    {activeTab !== 'queue' && queue.length > 1 && (
                      <span className="text-[9px] font-normal text-white/40 truncate w-[90%] mt-0.5">
                        Next: {queue[1]?.song_title} {queue.length > 2 ? `+${queue.length - 2}` : ''}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold text-white/60 data-[state=active]:text-white transition-colors">Live Chat</TabsTrigger>
                  <TabsTrigger value="members" className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-sm font-semibold text-white/60 data-[state=active]:text-white transition-colors">Members</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="queue" className="flex-1 w-full p-0 m-0 outline-none min-h-0">
                <div className="h-full flex flex-col overflow-hidden">
                  <div className="p-4 pb-0 z-10 shrink-0">
                    <Button variant="outline" className="w-full justify-start text-muted-foreground border-white/10 bg-black/20 hover:bg-white/5 hover:text-white rounded-xl h-10 shadow-sm transition-all" onClick={() => setIsSearchOpen(true)}>
                      <Search className="w-4 h-4 mr-2 opacity-70" /> Search for songs...
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <QueuePanel 
                      queue={queue} 
                      currentSongIndex={currentSongIndex} 
                      recommendedSongs={recommendedSongs} 
                      onPlaySong={playNow}
                      onPlayExisting={(song) => { playSong({...song, room_id: id as string} as any); }}
                      onSetCurrentIndex={setCurrentSongIndex}
                      onVote={handleVote}
                      onRemove={removeFromQueue}
                      onAdd={addToQueue}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 w-full p-0 m-0 outline-none min-h-0">
                <ChatPanel messages={messages} typingUsers={typingUsers} members={members} onSendMessage={handleSendMessage} />
              </TabsContent>

              <TabsContent value="members" className="flex-1 w-full p-0 m-0 outline-none min-h-0">
                <MembersPanel members={members} />
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
              <Input type="text" placeholder="Type a song, artist, or album..." value={newSong} onChange={(e) => setNewSong(e.target.value)} className="pl-9 bg-black/40 rounded-full h-10 border-white/10 focus-visible:ring-primary shadow-inner" autoFocus />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isSearching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-white/5 bg-black/20">
                  <Skeleton className="w-16 h-16 rounded-md shrink-0 bg-primary/10" />
                  <div className="flex-1 space-y-2 py-1"><Skeleton className="h-4 w-3/4 bg-primary/10" /><Skeleton className="h-3 w-1/2 bg-primary/10" /></div>
                </div>
              ))
            ) : searchResults.length > 0 ? (
              searchResults.map(track => (
                <div key={track.id} onClick={() => playNow(track)} className="flex gap-4 items-center p-3 rounded-xl cursor-pointer bg-black/20 hover:bg-white/5 transition-colors border border-white/5">
                  <img src={track.image} alt="Art" className="w-16 h-16 rounded-md shadow-sm object-cover shrink-0" />
                  <div className="overflow-hidden flex-1 flex flex-col justify-center h-16 py-0.5">
                    <p className="text-sm font-bold line-clamp-1">{track.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{track.artist}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); addToQueue(track); }} className="shrink-0 text-xs font-bold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">Add</Button>
                </div>
              ))
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showSwitchPrompt} onOpenChange={setShowSwitchPrompt}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <DialogTitle>Switch Rooms?</DialogTitle>
            <DialogDescription>
              You're currently listening in <span className="font-bold text-primary">{session?.roomName}</span>. 
              Do you want to leave this room and join a new one?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={cancelSwitch}>
              Cancel
            </Button>
            <Button onClick={confirmSwitch} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Join New Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
