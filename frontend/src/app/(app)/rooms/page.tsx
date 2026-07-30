'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Plus, Radio, Music, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { RoomCard, RoomCardProps } from '@/components/room/RoomCard';
import { LiveFeed, LiveEvent } from '@/components/room/LiveFeed';

const CATEGORIES = [
  { name: 'All', icon: '🎧' },
  { name: 'Coding', icon: '💻' },
  { name: 'Study', icon: '📚' },
  { name: 'Party', icon: '🎉' },
  { name: 'Rock', icon: '🎸' },
  { name: 'Chill', icon: '☕' },
  { name: 'Bollywood', icon: '✨' },
];

export default function ListenTogetherPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [rooms, setRooms] = useState<RoomCardProps[]>([]);
  const [feedEvents, setFeedEvents] = useState<LiveEvent[]>([]);
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomGenre, setNewRoomGenre] = useState('Chill');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Helper to fetch full room data including current song and activity
  const fetchRooms = async () => {
    try {
      // 1. Fetch active rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('Rooms')
        .select('*');
        
      if (roomsError) throw roomsError;
      
      const mappedRooms: RoomCardProps[] = [];
      
      for (const r of roomsData || []) {
        // 2. Fetch current song
        const { data: queueData } = await supabase
          .from('room_queue')
          .select('*')
          .eq('room_id', r.id)
          .eq('state', 'playing')
          .order('created_at', { ascending: false })
          .limit(1);
          
        const currentSong = queueData?.[0] || {
          song_title: "Waiting for DJ",
          song_artist: "Silence",
          song_image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=600&auto=format&fit=crop",
        };
        
        // 3. Fetch recent chat
        const { data: chatData } = await supabase
          .from('room_messages')
          .select('*')
          .eq('room_id', r.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        const recentChat = chatData?.[0] 
          ? `${chatData[0].user_name}: ${chatData[0].content}` 
          : "Room created";
          
        // 4. Fetch listeners (We use a random number for now if presence is hard to aggregate globally, 
        // but ideally we query a presence aggregate view. We'll set it to 1 + random to make it look alive if empty)
        
        mappedRooms.push({
          id: r.id,
          name: r.name || "Untitled Room",
          genre: "Chill", // In a real app, this comes from Rooms table
          listeners: Math.floor(Math.random() * 50) + 1, // Placeholder until presence aggregate
          chatting: Math.floor(Math.random() * 10),
          isVoiceActive: Math.random() > 0.7,
          nowPlaying: {
            title: currentSong.song_title,
            artist: currentSong.song_artist,
            image: currentSong.song_image,
            progress: 0, // Mock progress for global view
            duration: 180 
          },
          host: "Host", // Placeholder
          recentActivity: recentChat,
          isTrending: Math.random() > 0.8
        });
      }
      
      setRooms(mappedRooms);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();

    // Subscribe to global room events for the Live Feed
    const channel = supabase.channel('global_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_events' }, (payload) => {
        const ev = payload.new;
        setFeedEvents(prev => [{
          id: ev.id.toString(),
          type: ev.event_type as any,
          roomName: "A Room", // We would join this in a real query
          user: ev.user_name || "Someone",
          content: ev.details?.message || "did something",
          timestamp: new Date(ev.created_at).getTime()
        }, ...prev].slice(0, 50));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages' }, (payload) => {
        const msg = payload.new;
        setFeedEvents(prev => [{
          id: `msg-${msg.id}`,
          type: 'chat',
          roomName: "A Room",
          user: msg.user_name || "Someone",
          content: `said: "${msg.content.substring(0, 20)}..."`,
          timestamp: new Date(msg.created_at).getTime()
        }, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Time ticker for progress bars
  useEffect(() => {
    const timer = setInterval(() => {
      setRooms(prev => prev.map(r => {
        let newProg = r.nowPlaying.progress + 1;
        if (newProg > r.nowPlaying.duration) newProg = 0;
        return { ...r, nowPlaying: { ...r.nowPlaying, progress: newProg } };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const trendingRoom = [...rooms].sort((a, b) => b.listeners - a.listeners)[0];

  return (
    <div className="w-full h-full flex overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar scroll-smooth">
        <div className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-8">
          
          {/* Hero Section */}
          {trendingRoom && (
            <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-background to-background border border-primary/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-8 group">
              <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-1000" style={{ backgroundImage: `url(${trendingRoom.nowPlaying.image})` }} />
              
              <div className="relative z-10 flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-full font-bold text-sm backdrop-blur-md uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  LIVE NOW
                </div>
                
                <div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-lg mb-2 truncate">
                    {trendingRoom.name}
                  </h1>
                  <p className="text-xl text-white/70 mb-4 font-medium flex items-center gap-3">
                    <span className="text-primary font-bold">{trendingRoom.listeners.toLocaleString()}</span> listeners tuning in
                  </p>
                  
                  <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/5 p-3 rounded-2xl w-max pr-8">
                     <img src={trendingRoom.nowPlaying.image} className="w-12 h-12 rounded-lg" alt="art" />
                     <div>
                       <p className="text-sm font-bold text-white flex items-center gap-2">
                         🎵 {trendingRoom.nowPlaying.title}
                       </p>
                       <p className="text-xs text-primary font-medium flex items-center gap-2 mt-1">
                          {/* Animated host speaker icon */}
                          <Mic className="w-3 h-3 animate-pulse" /> {trendingRoom.host} is speaking...
                       </p>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 items-center pt-2">
                  <Button onClick={() => router.push(`/room/${trendingRoom.id}`)} size="lg" className="rounded-full shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] font-bold px-8 h-14 text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all">
                    Join Live &rarr;
                  </Button>
                  
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
                        <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()} className="w-full h-14 rounded-xl font-bold text-lg shadow-lg">
                          Launch Room
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Floating Avatars Background Effect */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden hidden md:block pointer-events-none">
                <motion.img src="https://api.dicebear.com/7.x/avataaars/svg?seed=A" className="absolute top-10 right-10 w-16 h-16 rounded-full border-2 border-primary/50 opacity-60" animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} />
                <motion.img src="https://api.dicebear.com/7.x/avataaars/svg?seed=B" className="absolute top-40 right-40 w-12 h-12 rounded-full border-2 border-pink-500/50 opacity-40" animate={{ y: [0, -30, 0] }} transition={{ duration: 5, repeat: Infinity }} />
                <motion.img src="https://api.dicebear.com/7.x/avataaars/svg?seed=C" className="absolute bottom-10 right-20 w-20 h-20 rounded-full border-2 border-blue-500/50 opacity-50" animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity }} />
              </div>
            </header>
          )}

          {/* Toolbar: Categories & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar w-full md:w-auto snap-x">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setActiveFilter(cat.name)}
                  className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center gap-2 ${
                    activeFilter === cat.name 
                    ? 'bg-primary text-white border-primary shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]' 
                    : 'bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 shrink-0 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="text" 
                placeholder="⌕ Search Rooms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 rounded-full h-12 text-base focus-visible:ring-primary focus-visible:border-primary transition-all hover:bg-white/10 shadow-inner w-full"
              />
              {/* Fake Trending Searches Dropdown on Focus */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Coding', 'Lofi', 'Taylor Swift', 'Bollywood'].map(t => (
                    <span key={t} className="bg-white/5 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors border border-white/5">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Room Grid or Empty State */}
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-glow">
                <Radio className="w-12 h-12 text-primary opacity-80" />
              </div>
              <h3 className="text-3xl font-extrabold mb-3">🎧 No live rooms right now</h3>
              <p className="text-lg text-muted-foreground max-w-md mb-8">
                Looks like it's quiet in the "{activeFilter}" category. Be the DJ and start your own room!
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 mr-2" />
                Start Your Own Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
      
      {/* Right Side Live Feed Panel */}
      <LiveFeed events={feedEvents} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
