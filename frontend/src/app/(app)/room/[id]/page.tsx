'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Lock, Users, Music, Heart, Clock, MessageSquare } from 'lucide-react';

// Modular Components
import { ReactionOverlay } from '@/components/room/ReactionOverlay';
import { MembersPanel } from '@/components/room/MembersPanel';
import { ChatPanel } from '@/components/room/ChatPanel';
import { ActivityFeed } from '@/components/room/ActivityFeed';
import { VoicePanel } from '@/components/room/VoicePanel';
import { NowPlayingCinematic } from '@/components/room/NowPlayingCinematic';
import { QueuePanel } from '@/components/room/QueuePanel';

// Provider Hook
import { useRoom } from '@/hooks/useRoom';

export default function RoomPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const autoplay = searchParams.get('autoplay');

  // Room State from Provider
  const { members, messages, reactions, activities, typingUsers, queue, provider } = useRoom(id as string);

  // Room State
  const [roomName, setRoomName] = useState('Community Room');
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'members'>('queue');
  
  // Search State
  const [newSong, setNewSong] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Playback & Voice State
  const { playSong, togglePlay: globalTogglePlay, isPlaying: globalIsPlaying, currentSong: globalCurrentSong, progress, duration } = usePlayer();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerMode, setPlayerMode] = useState<'artwork' | 'lyrics'>('artwork');
  const currentSong = queue[currentSongIndex] || globalCurrentSong;

  // WebRTC State
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`/api/rooms/${id}`)
      .then(res => { if (!res.ok) throw new Error('Room not found'); return res.json(); })
      .then(data => { if (data.name) setRoomName(data.name); })
      .catch(err => { console.error(err); setRoomName(`Room ${id}`); });

    fetch(`/api/spotify/trending`)
      .then(res => { if (!res.ok) throw new Error('Trending not found'); return res.json(); })
      .then(data => { if (Array.isArray(data)) setTrendingSongs(data); })
      .catch(console.error);
  }, [id]);

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
        });
      }
    }
  }, [queue, autoplay, globalIsPlaying, currentSongIndex, globalCurrentSong, playSong, id]);

  // (setVideoState removed)

  useEffect(() => {
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/spotify/search?q=\${encodeURIComponent(newSong)}`);
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
    const songData = { song_uri: track.uri, song_title: track.title, song_artist: track.artist, song_image: track.image };
    await provider.addSong(songData);
    setNewSong('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const playNow = async (track: any) => {
    playSong({ song_uri: track.uri, song_title: track.title, song_artist: track.artist, song_image: track.image, room_id: id as string });
    const songData = { song_uri: track.uri, song_title: track.title, song_artist: track.artist, song_image: track.image };
    await provider.addSong(songData);
    
    // We let the provider's queue sync update the queue, then we'll jump to the end
    setTimeout(() => {
      setCurrentSongIndex(queue.length);
    }, 500);

    setNewSong('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const removeFromQueue = async (songId: number) => {
    // Phase 3 feature, backend endpoint might exist
    try {
      await fetch(`/api/rooms/\${id}/queue/\${songId}`, { method: 'DELETE' });
    } catch (error) { console.error(error); }
  };

  const handleVote = (songId: number, direction: 'up' | 'down') => {
    provider.voteSong(songId.toString(), direction);
  };

  const handleSendMessage = (content: string) => {
    provider.sendMessage(content);
  };

  const sendReaction = (emoji: string) => {
    provider.sendReaction(emoji);
  };

  useEffect(() => {
    if (!currentSong) return;
    if (!globalCurrentSong || globalCurrentSong.song_uri !== currentSong.song_uri) {
      playSong({ ...currentSong, room_id: id as string });
    }
  }, [currentSongIndex, currentSong, globalCurrentSong, playSong, id]);

  // (setOnEndedCallback removed since it's not in PlayerContext yet)

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] md:h-[calc(100vh-14rem)] overflow-hidden relative w-full bg-background rounded-2xl shadow-2xl border border-white/5">
      
      <ReactionOverlay reactions={reactions} />
      
      {/* Dynamic Cinematic Background */}
      {currentSong?.song_image && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 opacity-50 blur-[100px] scale-150 transition-all duration-1000"
            style={{
              backgroundImage: `url(\${currentSong.song_image?.replace('100x100', '1000x1000') || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />
        </div>
      )}

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col z-10 w-full max-w-[1800px] mx-auto min-h-0 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pb-6">
          
          {/* Left: Header, Cinematic & Activity */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{roomName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Private</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Users className="w-3.5 h-3.5" /> {members.length} Members</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-xs font-medium text-muted-foreground"><Music className="w-3.5 h-3.5" /> {queue.length} Songs</span>
                </div>
              </div>
            </header>

            <div className="flex items-center gap-6 border-b border-white/10 pb-3 mb-4 px-2">
              <button 
                onClick={() => setPlayerMode('artwork')} 
                className={`text-sm font-bold uppercase tracking-widest transition-colors \${playerMode === 'artwork' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
              >
                ARTWORK
              </button>
              <button 
                onClick={() => setPlayerMode('lyrics')} 
                className={`text-sm font-bold uppercase tracking-widest transition-colors \${playerMode === 'lyrics' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
              >
                LYRICS
              </button>
            </div>
            
            <div className="mb-6 shrink-0">
              <NowPlayingCinematic currentSong={currentSong} playerMode={playerMode} progress={progress} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full lg:w-[85%] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 pr-2">
                
                {/* Chat Preview */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col transition-all hover:bg-black/30 hover:border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Chat Preview</h3>
                  <div className="flex-1 flex flex-col justify-end space-y-2">
                    {messages.slice(-2).map((msg, idx) => (
                      <div key={idx} className="text-sm leading-relaxed">
                        <span className="font-bold text-primary/90 mr-2">{msg.user_name}:</span>
                        <span className="text-foreground/80">{msg.content}</span>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-sm text-muted-foreground">No recent messages.</p>}
                  </div>
                </div>

                <ActivityFeed activities={activities} />

              </div>
            </div>
          </div>

          {/* Right: Sidebar Container */}
          <div className="w-full lg:w-[35%] h-full shrink-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl" style={{ background: 'rgba(15,15,20,0.55)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            
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
                    <Button variant="outline" className="w-full justify-start text-muted-foreground border-white/10 bg-black/20 hover:bg-white/5 hover:text-white rounded-xl h-10 shadow-sm transition-all" onClick={() => setIsSearchOpen(true)}>
                      <Search className="w-4 h-4 mr-2 opacity-70" /> Search for songs...
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <QueuePanel 
                      queue={queue} 
                      currentSongIndex={currentSongIndex} 
                      trendingSongs={trendingSongs} 
                      onPlaySong={(song) => { playSong({...song, room_id: id as string}); }}
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
    </div>
  );
}
