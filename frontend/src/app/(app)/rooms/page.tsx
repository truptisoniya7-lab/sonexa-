'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Globe, Lock, Search, Plus, Trash2, Edit2, PlayCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public');
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [activeTab]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setIsLoadingTrending(true);
    try {
      const res = await fetch('https://itunes.apple.com/us/rss/topsongs/limit=5/json');
      const data = await res.json();
      const songs = data.feed.entry.map((entry: any) => ({
        id: entry.id.attributes['im:id'],
        title: entry['im:name'].label,
        artist: entry['im:artist'].label,
        image: entry['im:image'][2].label
      }));
      setTrendingSongs(songs);
    } catch (e) {
      console.error('Failed to fetch trending', e);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const userCreatedRooms = data.filter(r => r.name !== 'My Private Session');

        if (activeTab === 'public') {
          setRooms(userCreatedRooms.filter(r => r.is_public === 1)); 
        } else {
          setRooms(userCreatedRooms.filter(r => r.host_id === 1)); 
        }
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName, host_id: 1, isPublic: isPublic ? 1 : 0 })
      });
      const data = await res.json();
      
      if (data.id) {
        router.push(`/room/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create room', error);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}`, { method: 'DELETE' });
      fetchRooms();
    } catch (error) {
      console.error('Failed to delete room', error);
    }
  };

  const saveEditRoom = async (id: number) => {
    if (!editName.trim()) {
      setEditingRoom(null);
      return;
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Failed to edit room', error);
    }
  };

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Discover and join listening rooms.</p>
        </div>
        
        <Card className="glass-panel w-full lg:w-[400px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Start a Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="New Room Name..." 
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createRoom()}
                className="bg-background/50"
              />
              <Button onClick={createRoom} size="icon" className="shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <RadioGroup defaultValue="public" className="flex gap-4" onValueChange={(val) => setIsPublic(val === 'public')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="r1" />
                <Label htmlFor="r1" className="cursor-pointer">Public Room</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="r2" />
                <Label htmlFor="r2" className="cursor-pointer">Private</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Tabs defaultValue="public" onValueChange={(val) => setActiveTab(val as 'public' | 'mine')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="glass-panel bg-background/40">
                <TabsTrigger value="public">Recently Launched</TabsTrigger>
                <TabsTrigger value="mine">My Rooms</TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search Rooms..."
                  className="pl-8 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="public" className="m-0">
              <RoomGrid 
                rooms={filteredRooms} 
                isLoading={isLoadingRooms} 
                editingRoom={editingRoom}
                editName={editName}
                setEditName={setEditName}
                saveEditRoom={saveEditRoom}
                setEditingRoom={setEditingRoom}
                deleteRoom={deleteRoom}
                router={router}
              />
            </TabsContent>
            <TabsContent value="mine" className="m-0">
              <RoomGrid 
                rooms={filteredRooms} 
                isLoading={isLoadingRooms} 
                editingRoom={editingRoom}
                editName={editName}
                setEditName={setEditName}
                saveEditRoom={saveEditRoom}
                setEditingRoom={setEditingRoom}
                deleteRoom={deleteRoom}
                router={router}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar for Trending */}
        <div className="xl:col-span-1">
          <Card className="glass-panel sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Trending Globally
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingTrending ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : trendingSongs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No trends available.</p>
                ) : (
                  trendingSongs.map((song, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={song.id} 
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-4 text-center font-bold text-muted-foreground group-hover:text-primary transition-colors">{idx + 1}</div>
                      <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                        <img src={song.image} alt="Art" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RoomGrid({ rooms, isLoading, editingRoom, editName, setEditName, saveEditRoom, setEditingRoom, deleteRoom, router }: any) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-panel">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card className="glass-panel bg-background/40 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No rooms found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">There are no active sessions matching your criteria right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {rooms.map((room: any, idx: number) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-panel h-full flex flex-col hover:border-primary/50 transition-colors group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  {editingRoom === room.id ? (
                    <div className="flex gap-2 w-full">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} autoFocus className="h-8" />
                      <Button onClick={() => saveEditRoom(room.id)} size="sm">Save</Button>
                    </div>
                  ) : (
                    <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">{room.name}</CardTitle>
                  )}
                  
                  {room.host_id === 1 && editingRoom !== room.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditingRoom(room.id); setEditName(room.name); }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteRoom(room.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  {room.is_public ? (
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Public</span>
                  ) : (
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Private</span>
                  )}
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Active
                  </span>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto pt-4">
                <Button className="w-full" onClick={() => router.push(`/room/${room.id}`)}>
                  Join Room
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
