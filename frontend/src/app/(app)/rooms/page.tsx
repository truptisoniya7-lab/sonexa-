'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Globe, Search, Plus, PlayCircle, Users, MessageSquare, Mic, Hash, Music, Radio, Heart, UserPlus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = ['All', 'Chill', 'Party', 'Study', 'Coding', 'Bollywood', 'Rock', 'Gaming'];

const INITIAL_ROOMS = [
  {
    id: 1,
    name: "Late Night Coding",
    genre: "Coding",
    listeners: 218,
    chatting: 41,
    isVoiceActive: true,
    nowPlaying: {
      title: "Perfect",
      artist: "Ed Sheeran",
      image: "https://picsum.photos/seed/coding/600/400",
      progress: 133,
      duration: 294
    },
    host: "Alex",
    recentActivity: "🎵 Song changed 42 sec ago"
  },
  {
    id: 2,
    name: "Bollywood Party",
    genre: "Bollywood",
    listeners: 1283,
    chatting: 312,
    isVoiceActive: true,
    nowPlaying: {
      title: "Kesariya",
      artist: "Arijit Singh",
      image: "https://picsum.photos/seed/bollywood/600/400",
      progress: 45,
      duration: 268
    },
    host: "Priya",
    recentActivity: "❤️ 24 reactions in last minute"
  },
  {
    id: 3,
    name: "Chill Vibes Only",
    genre: "Chill",
    listeners: 145,
    chatting: 23,
    isVoiceActive: true,
    nowPlaying: {
      title: "Blinding Lights",
      artist: "The Weeknd",
      image: "https://picsum.photos/seed/chill/600/400",
      progress: 180,
      duration: 200
    },
    host: "Sam",
    recentActivity: "👤 Rahul joined"
  },
  {
    id: 4,
    name: "Focus & Study",
    genre: "Study",
    listeners: 312,
    chatting: 5,
    isVoiceActive: false,
    nowPlaying: {
      title: "Lofi Hip Hop Radio",
      artist: "Lofi Girl",
      image: "https://picsum.photos/seed/study/600/400",
      progress: 3540,
      duration: 7200
    },
    host: "LofiBot",
    recentActivity: "💬 2 new messages"
  }
];

const RANDOM_ACTIVITIES = [
  "👤 Rahul joined",
  "👤 Sarah joined",
  "👤 Amit left",
  "❤️ 12 reactions",
  "❤️ 5 reactions",
  "💬 3 new messages",
  "💬 6 new messages",
  "🎵 Song added to queue",
  "🎤 Host is typing..."
];

export default function ListenTogetherPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Real-time simulated state
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomGenre, setNewRoomGenre] = useState('Chill');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms(currentRooms => 
        currentRooms.map(room => {
          // Progress playback by 1 second
          let newProgress = room.nowPlaying.progress + 1;
          if (newProgress > room.nowPlaying.duration) newProgress = 0;

          // 30% chance to fluctuate listeners/chatting and change activity
          let newListeners = room.listeners;
          let newChatting = room.chatting;
          let newActivity = room.recentActivity;

          if (Math.random() > 0.7) {
            const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
            newListeners = Math.max(1, newListeners + fluctuation);
            newChatting = Math.max(0, newChatting + (Math.random() > 0.5 ? 1 : 0));
            newActivity = RANDOM_ACTIVITIES[Math.floor(Math.random() * RANDOM_ACTIVITIES.length)];
          }

          return {
            ...room,
            listeners: newListeners,
            chatting: newChatting,
            recentActivity: newActivity,
            nowPlaying: {
              ...room.nowPlaying,
              progress: newProgress
            }
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.nowPlaying.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = activeFilter === 'All' || room.genre === activeFilter;
    return matchesSearch && matchesGenre;
  });

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const res = await fetch(`/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName, host_id: 1, isPublic: isPublic ? 1 : 0 })
      });
      const data = await res.json();
      if (data.id) {
        setIsCreateOpen(false);
        router.push(`/room/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create room', error);
    }
  };

  // Find the most popular room for the hero section
  const trendingRoom = [...rooms].sort((a, b) => b.listeners - a.listeners)[0];

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-10">
        
        {/* Hero Section */}
        {trendingRoom && (
          <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-background to-background border border-primary/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-8 group">
            <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: `url(${trendingRoom.nowPlaying.image})` }} />
            
            <div className="relative z-10 flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full font-bold text-sm border border-primary/30 backdrop-blur-md">
                <Radio className="w-4 h-4" /> Listen Together
              </div>
              
              <div>
                <p className="text-xl text-white/70 mb-2 font-medium">Now playing across Sonexa</p>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-lg mb-4">
                  {trendingRoom.nowPlaying.title}
                </h1>
                <div className="flex items-center gap-4 text-lg font-medium text-white/90">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    {trendingRoom.listeners.toLocaleString()} people listening
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-center pt-2">
                <Button onClick={() => router.push(`/room/${trendingRoom.id}`)} size="lg" className="rounded-full shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] font-bold px-8 h-14 text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all">
                  Join the trend &rarr;
                </Button>
                
                {/* Create Room Modal Trigger */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-14 text-lg border-white/20 hover:bg-white/10 backdrop-blur-md">
                      <Plus className="w-5 h-5 mr-2" /> Start Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        🎉 Start Listening Together
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-white/70">Room Name</Label>
                        <Input 
                          placeholder="e.g. Late Night Lo-Fi" 
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          className="bg-black/50 border-white/10 h-12 text-lg rounded-xl focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white/70">Genre</Label>
                        <div className="flex flex-wrap gap-2">
                          {FILTERS.filter(f => f !== 'All').map(genre => (
                            <button
                              key={genre}
                              onClick={() => setNewRoomGenre(genre)}
                              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                                newRoomGenre === genre 
                                ? 'bg-primary border-primary text-white shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)]' 
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white/70">Privacy</Label>
                        <RadioGroup defaultValue="public" className="flex gap-4" onValueChange={(val) => setIsPublic(val === 'public')}>
                          <div className="flex items-center space-x-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10 cursor-pointer flex-1 justify-center transition-colors hover:bg-white/10">
                            <RadioGroupItem value="public" id="r1" />
                            <Label htmlFor="r1" className="cursor-pointer font-medium">Public</Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10 cursor-pointer flex-1 justify-center transition-colors hover:bg-white/10">
                            <RadioGroupItem value="private" id="r2" />
                            <Label htmlFor="r2" className="cursor-pointer font-medium">Private</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()} className="w-full h-14 rounded-xl font-bold text-lg shadow-lg">
                        Launch Room
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Visual representation of the trending song */}
            <div className="relative w-64 h-64 shrink-0 hidden md:block">
              <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite] border-dashed" />
              <div className="absolute inset-4 rounded-full overflow-hidden shadow-2xl border-4 border-background">
                <img src={trendingRoom.nowPlaying.image} className="w-full h-full object-cover animate-[spin_20s_linear_infinite]" alt="Record" />
                {/* Center hole */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-background border-2 border-primary/50 shadow-inner" />
              </div>
            </div>
          </header>
        )}

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl py-4 border-b border-border/40 -mx-6 px-6">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0 snap-x">
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                  activeFilter === filter 
                  ? 'bg-primary text-white border-primary shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]' 
                  : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground'
                }`}
              >
                {filter !== 'All' && <Hash className="w-3.5 h-3.5 inline-block mr-1 opacity-70" />}
                {filter}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search rooms or songs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 rounded-full h-12 text-base focus-visible:ring-primary focus-visible:border-primary transition-all hover:bg-white/10 shadow-inner w-full"
            />
          </div>
        </div>

        {/* Room Grid or Empty State */}
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Radio className="w-12 h-12 text-primary opacity-80" />
            </div>
            <h3 className="text-3xl font-extrabold mb-3">🎧 No live rooms right now</h3>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Looks like it's quiet in the "{activeFilter}" category. Be the DJ and start your own room!
            </p>
            <Button onClick={() => setIsCreateOpen(true)} size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-xl hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 mr-2" />
              Start Your Own Room
            </Button>

            <div className="mt-16 w-full max-w-4xl text-left border-t border-border/50 pt-12">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" /> Recommended Genres
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FILTERS.filter(f => f !== 'All').slice(0, 4).map((genre) => (
                  <Card key={genre} onClick={() => setActiveFilter(genre)} className="glass-panel cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
                        <h5 className="font-bold text-lg group-hover:text-primary transition-colors">{genre}</h5>
                     </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room) => {
                const progressPercent = (room.nowPlaying.progress / room.nowPlaying.duration) * 100;
                
                return (
                  <motion.div
                    key={room.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-black/40 backdrop-blur-xl border-white/10 hover:border-primary/50 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.2)]">
                      <div className="p-5 flex-1 flex flex-col relative z-10">
                        
                        {/* Header: Title & Host */}
                        <div className="mb-4">
                          <h3 className="font-extrabold text-xl truncate group-hover:text-primary transition-colors text-white">{room.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-white/20 inline-flex items-center justify-center text-[8px] font-bold text-white">
                              {room.host.charAt(0)}
                            </span>
                            Hosted by {room.host}
                          </p>
                        </div>

                        {/* Song Details with Progress */}
                        <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5 flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-md overflow-hidden relative shrink-0">
                            <img src={room.nowPlaying.image} alt={room.nowPlaying.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-1.5 h-3 bg-white mx-0.5 rounded-full animate-[bounce_1s_infinite_0ms]" />
                              <div className="w-1.5 h-5 bg-white mx-0.5 rounded-full animate-[bounce_1s_infinite_200ms]" />
                              <div className="w-1.5 h-2 bg-white mx-0.5 rounded-full animate-[bounce_1s_infinite_400ms]" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate text-white">{room.nowPlaying.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{room.nowPlaying.artist}</p>
                            
                            {/* Playback Progress */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[9px] text-muted-foreground font-mono w-6">{formatTime(room.nowPlaying.progress)}</span>
                              <div className="h-1 flex-1 bg-black/50 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                              </div>
                              <span className="text-[9px] text-muted-foreground font-mono w-6 text-right">{formatTime(room.nowPlaying.duration)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5 bg-background/50 border border-white/5 px-2.5 py-1 rounded-md text-white/80">
                            <Users className="w-3.5 h-3.5 text-blue-400" /> {room.listeners}
                          </div>
                          <div className="flex items-center gap-1.5 bg-background/50 border border-white/5 px-2.5 py-1 rounded-md text-white/80">
                            <MessageSquare className="w-3.5 h-3.5 text-pink-400" /> {room.chatting}
                          </div>
                          {room.isVoiceActive ? (
                            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-md">
                              <Mic className="w-3.5 h-3.5" /> Voice Live
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-background/50 border border-white/5 px-2.5 py-1 rounded-md text-white/80">
                              <span className="relative flex h-2 w-2 mr-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              Playing Now
                            </div>
                          )}
                        </div>

                        {/* Recent Activity Ticker & Join CTA */}
                        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                          <div className="text-[10px] text-muted-foreground flex-1 truncate flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                            {room.recentActivity.includes('❤️') && <Heart className="w-3 h-3 text-red-500" />}
                            {room.recentActivity.includes('👤') && <UserPlus className="w-3 h-3 text-blue-400" />}
                            {room.recentActivity.includes('💬') && <MessageSquare className="w-3 h-3 text-pink-400" />}
                            {room.recentActivity.includes('🎵') && <Music className="w-3 h-3 text-primary" />}
                            {room.recentActivity.includes('🎤') && <Mic className="w-3 h-3 text-green-400" />}
                            <span className="truncate" key={room.recentActivity}>
                              <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                {room.recentActivity}
                              </motion.span>
                            </span>
                          </div>
                          
                          <Button onClick={() => router.push(`/room/${room.id}`)} size="sm" className="rounded-full shadow-lg font-bold px-4 bg-white text-black hover:bg-white/90 group-hover:scale-105 transition-transform shrink-0 h-8">
                             Join ▶
                          </Button>
                        </div>

                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
