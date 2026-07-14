'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Play, Pause, SkipForward, SkipBack, Smile, Send, Search, X, Heart, Flame, Music, Laugh, PartyPopper, ChevronUp, ChevronDown, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_MEMBERS = [
  { id: 1, name: 'You (Host)', avatar: 'https://i.pravatar.cc/150?u=1', role: 'Host', isSpeaking: false },
  { id: 2, name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=2', role: 'Listener', isSpeaking: true },
  { id: 3, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=3', role: 'Listener', isSpeaking: false },
];

export default function RoomPage() {
  const { id } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomName, setRoomName] = useState('Loading Room...');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'members'>('queue');

  // Queue State
  const [queue, setQueue] = useState<any[]>([]);
  const [newSong, setNewSong] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Playback State
  const { playSong, togglePlay: globalTogglePlay, isPlaying: globalIsPlaying, currentSong: globalCurrentSong, setOnEndedCallback } = usePlayer();
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
    fetch(`http://localhost:5000/rooms/${id}`)
      .then(res => res.json())
      .then(data => setRoomName(data.name))
      .catch(console.error);

    fetch(`http://localhost:5000/rooms/${id}/queue`)
      .then(res => res.json())
      .then(data => {
        // Add mock votes if missing
        const queueWithVotes = data.map((item: any) => ({ ...item, votes: Math.floor(Math.random() * 5) }));
        setQueue(queueWithVotes);
      })
      .catch(console.error);
      
    fetch(`http://localhost:5000/messages/${id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', id);
    });

    newSocket.on('queue_updated', () => {
      fetch(`http://localhost:5000/rooms/${id}/queue`)
        .then(res => res.json())
        .then(data => {
          const queueWithVotes = data.map((item: any) => ({ ...item, votes: Math.floor(Math.random() * 5) }));
          setQueue(queueWithVotes);
        });
    });

    newSocket.on('new_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('new_reaction', (data) => {
      const reaction = { id: Math.random().toString(), emoji: data.reaction, right: Math.floor(Math.random() * 20) + 10 };
      setActiveReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    return () => {
      newSocket.emit('leave_room', id);
      newSocket.disconnect();
      if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewSong(val);
    
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/spotify/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (Array.isArray(data)) setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addToQueue = async (track: any) => {
    const songData = { 
      song_uri: track.uri, 
      song_title: track.title, 
      song_artist: track.artist, 
      song_image: track.image,
      added_by: 1 
    };
    try {
      await fetch(`http://localhost:5000/rooms/${id}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      setNewSong('');
      setSearchResults([]);
      socket?.emit('add_to_queue', { roomId: id });
    } catch (error) { console.error(error); }
  };

  const removeFromQueue = async (songId: number) => {
    try {
      await fetch(`http://localhost:5000/rooms/${id}/queue/${songId}`, {
        method: 'DELETE'
      });
      socket?.emit('remove_from_queue', { roomId: id });
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
    // In a real app, this would emit to socket to sync votes across clients
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msgData = { room_id: id, user_id: 1, content: chatInput, type: 'text' };
    try {
      const res = await fetch(`http://localhost:5000/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      const data = await res.json();
      setChatInput('');
      socket?.emit('send_message', { ...data, roomId: id });
    } catch (error) { console.error(error); }
  };

  const sendReaction = (emoji: string) => {
    socket?.emit('reaction', { roomId: id, reaction: emoji, user: 1 });
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
      socket?.emit('sync_playback', { roomId: id, state: 'play' });
      return;
    }
    
    globalTogglePlay();
    socket?.emit('sync_playback', { roomId: id, state: !globalIsPlaying ? 'play' : 'pause' });
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

  useEffect(() => {
    if (!socket) return;
    const handleSync = (data: any) => {
      if (data.state === 'play' && !globalIsPlaying) {
        globalTogglePlay();
      } else if (data.state === 'pause' && globalIsPlaying) {
        globalTogglePlay();
      }
    };
    socket.on('playback_synced', handleSync);
    return () => { socket.off('playback_synced', handleSync); };
  }, [socket, globalIsPlaying]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] lg:h-[700px]">
        {/* Main Player Area */}
        <Card className="glass-panel lg:col-span-2 relative overflow-hidden flex flex-col items-center justify-center border-primary/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/5 pointer-events-none" />
          
          {currentSong ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentSong.song_uri}
              className="flex flex-col items-center z-10 w-full max-w-lg px-6"
            >
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-2xl mb-8 shadow-2xl overflow-hidden group border border-border/50">
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
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-semibold text-white tracking-wider uppercase">Now Playing</span>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-center line-clamp-1 tracking-tight text-foreground">{currentSong.song_title}</h2>
              <p className="text-muted-foreground mb-10 text-center text-xl font-medium">{currentSong.song_artist}</p>

              <div className="flex items-center gap-8 bg-background/40 backdrop-blur-xl px-8 py-4 rounded-full border border-border/50 shadow-xl">
                <Button variant="ghost" size="icon" onClick={playPrev} disabled={currentSongIndex === 0} className="w-14 h-14 rounded-full hover:bg-primary/20 text-foreground">
                  <SkipBack className="w-7 h-7 fill-current" />
                </Button>
                <Button onClick={togglePlay} size="icon" className="w-24 h-24 rounded-full shadow-2xl hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background">
                  {(globalCurrentSong?.song_uri === currentSong.song_uri && globalIsPlaying) ? (
                    <Pause className="w-10 h-10 fill-current" />
                  ) : (
                    <Play className="w-10 h-10 fill-current ml-1" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext} disabled={currentSongIndex >= queue.length - 1} className="w-14 h-14 rounded-full hover:bg-primary/20 text-foreground">
                  <SkipForward className="w-7 h-7 fill-current" />
                </Button>
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
                {queue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70">
                    <Music className="w-10 h-10 mb-3 opacity-50" />
                    <p className="font-medium">The queue is empty.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {queue.map((song, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={song.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group shadow-sm ${index === currentSongIndex ? 'bg-primary/20 border border-primary/30' : 'bg-background/40 border border-border/30 hover:bg-accent/50'}`}
                      >
                        <div onClick={() => setCurrentSongIndex(index)} className="w-6 text-center font-medium text-sm text-muted-foreground shrink-0">
                          {index === currentSongIndex ? <Play className="w-3 h-3 text-primary mx-auto fill-current" /> : index + 1}
                        </div>
                        {song.song_image ? (
                          <img src={song.song_image} alt="Art" className="w-12 h-12 rounded-lg object-cover shadow-sm" onClick={() => setCurrentSongIndex(index)} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Music className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1 min-w-0" onClick={() => setCurrentSongIndex(index)}>
                          <p className={`text-sm font-bold truncate ${index === currentSongIndex ? 'text-primary' : ''}`}>{song.song_title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.song_artist}</p>
                        </div>
                        
                        {/* Voting Section */}
                        <div className="flex flex-col items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-background/60 p-1 rounded-md">
                          <button onClick={(e) => { e.stopPropagation(); handleVote(song.id, 'up'); }}><ChevronUp className="w-4 h-4 text-green-500 hover:text-green-400" /></button>
                          <span className="text-[10px] font-bold leading-none">{song.votes || 0}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleVote(song.id, 'down'); }}><ChevronDown className="w-4 h-4 text-red-500 hover:text-red-400" /></button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); removeFromQueue(song.id); }}
                          className={`w-8 h-8 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${index === currentSongIndex ? 'text-primary hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
              <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-md relative">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Search songs to add..." 
                    value={newSong} 
                    onChange={handleSearchChange} 
                    className="pl-9 bg-background rounded-full h-10 border-primary/20 focus-visible:ring-primary shadow-inner"
                  />
                </div>
                
                <AnimatePresence>
                  {searchResults.length > 0 && newSong.trim() && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-[calc(100%+12px)] left-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-2 max-h-72 overflow-y-auto"
                    >
                      {searchResults.map(track => (
                        <div key={track.id} onClick={() => addToQueue(track)} className="flex gap-3 items-center p-2 rounded-xl cursor-pointer hover:bg-accent transition-colors group border border-transparent hover:border-border">
                          {track.image && <img src={track.image} alt="Art" className="w-12 h-12 rounded-lg shadow-sm" />}
                          <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs rounded-full">Add</Button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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
    </div>
  );
}
