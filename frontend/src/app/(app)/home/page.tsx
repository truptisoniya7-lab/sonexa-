'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlayCircle, Search, X, Activity, Clock, MoreHorizontal, User, Music, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CATEGORIES = [
  { id: 'trending', title: 'Trending Now', query: 'global top 50 official music video' },
  { id: 'recommendations', title: 'Made For You', query: 'top hits 2024 official music video' },
];

const MOCK_FRIENDS = [
  { id: 1, name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1', status: 'listening', song: 'Starboy', artist: 'The Weeknd' },
  { id: 2, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=2', status: 'listening', song: 'Cruel Summer', artist: 'Taylor Swift' },
  { id: 3, name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=3', status: 'offline', song: 'Last seen 2h ago', artist: '' },
  { id: 4, name: 'Emily Davis', avatar: 'https://i.pravatar.cc/150?u=4', status: 'listening', song: 'Levitating', artist: 'Dua Lipa' },
];

export default function HomePage() {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [greeting, setGreeting] = useState('Good evening');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    CATEGORIES.forEach(async (cat) => {
      try {
        const res = await fetch(`http://localhost:5000/spotify/search?q=${encodeURIComponent(cat.query)}`);
        const tracks = await res.json();
        setCategoryData(prev => ({ ...prev, [cat.id]: Array.isArray(tracks) ? tracks : [] }));
      } catch (e) {
        console.error(`Failed to fetch ${cat.title}`, e);
        setCategoryData(prev => ({ ...prev, [cat.id]: [] }));
      }
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:5000/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const tracks = await res.json();
      setSearchResults(Array.isArray(tracks) ? tracks : []);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsSearching(false);
    }
  };

  const playSong = async (track: any) => {
    try {
      const resRoom = await fetch('http://localhost:5000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Private Session', host_id: 1, isPublic: 0 })
      });
      const room = await resRoom.json();

      if (room.id) {
        await fetch(`http://localhost:5000/rooms/${room.id}/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song_uri: track.uri, song_title: track.title, song_artist: track.artist, song_image: track.image, added_by: 1 })
        });
        router.push(`/room/${room.id}`);
      }
    } catch (error) { console.error('Failed to start solo room', error); }
  };

  const playHeroMix = () => {
    playSong({
      uri: 'spotify:track:4u7EnebtmKWzUH433cf5Qv', // Example track
      title: 'Midnight Memories',
      artist: 'Synthwave Essentials',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-12">
          
          {/* Header & Search */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{greeting}</h1>
            <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="What do you want to play?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-primary/20 focus-visible:ring-primary rounded-full h-10 shadow-sm"
                />
                {searchQuery && (
                  <X 
                    className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  />
                )}
              </div>
            </form>
          </header>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Search Results</h2>
                <Button variant="ghost" onClick={() => {setSearchResults([]); setSearchQuery('');}} className="text-muted-foreground">Clear</Button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x">
                {searchResults.map((track, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="min-w-[160px] md:min-w-[200px] snap-start group cursor-pointer"
                    onClick={() => playSong(track)}
                  >
                    <Card className="glass-panel p-4 h-full border-transparent hover:border-primary/30 transition-all bg-background/40 hover:bg-background/60 shadow-lg">
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-xl">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-14 h-14 text-primary fill-primary/20 shadow-xl rounded-full" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm md:text-base truncate mb-1">{track.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{track.artist}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {!searchResults.length && (
            <>
              {/* Hero Section */}
              <section onClick={playHeroMix} className="relative overflow-hidden rounded-3xl h-72 sm:h-80 shadow-2xl group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-purple-600/80 to-blue-600/80 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">Featured Release</span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-primary-foreground mb-2">Midnight Memories</h2>
                  <p className="text-primary-foreground/90 max-w-lg mb-6">Dive into the latest curated mix of synthwave and night-drive essentials. Perfect for your late-night coding sessions.</p>
                  <Button className="w-fit rounded-full px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg" onClick={(e) => { e.stopPropagation(); playHeroMix(); }}>
                    <PlayCircle className="w-5 h-5 mr-2" /> Listen Now
                  </Button>
                </div>
              </section>

              {/* Continue Listening */}
              <section>
                <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" /> Continue Listening
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {!categoryData['recommendations'] ? (
                     Array.from({ length: 4 }).map((_, i) => (
                       <Skeleton key={i} className="h-20 w-full rounded-xl bg-background/40" />
                     ))
                  ) : (
                     categoryData['recommendations'].slice(0, 4).map((track, idx) => (
                       <motion.div key={idx} initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay: idx*0.05}}>
                         <Card className="glass-panel group cursor-pointer overflow-hidden hover:bg-accent/20 transition-all border-transparent hover:border-primary/30" onClick={() => playSong(track)}>
                           <div className="flex items-center h-20">
                             <img src={track.image} alt={track.title} className="w-20 h-20 object-cover shadow-lg" />
                             <div className="flex-1 px-4 truncate">
                               <p className="font-semibold text-sm truncate">{track.title}</p>
                               <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                             </div>
                             <div className="px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <PlayCircle className="w-8 h-8 text-primary fill-primary/20 shadow-xl rounded-full" />
                             </div>
                           </div>
                         </Card>
                       </motion.div>
                     ))
                  )}
                </div>
              </section>

              {/* Categories (Trending & Recommendations) */}
              {CATEGORIES.map(category => {
                const tracks = categoryData[category.id];
                
                if (tracks && tracks.length === 0) return null;

                return (
                  <section key={category.id}>
                    <h2 className="text-2xl font-bold mb-6 tracking-tight">{category.title}</h2>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x">
                      {!tracks ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="min-w-[160px] md:min-w-[200px] space-y-4">
                            <Skeleton className="w-full aspect-square rounded-xl bg-background/40" />
                            <Skeleton className="h-4 w-3/4 bg-background/40" />
                            <Skeleton className="h-3 w-1/2 bg-background/40" />
                          </div>
                        ))
                      ) : (
                        tracks.map((track, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="min-w-[160px] md:min-w-[200px] snap-start group cursor-pointer"
                            onClick={() => playSong(track)}
                          >
                            <Card className="glass-panel p-4 h-full border-transparent hover:border-primary/30 transition-all bg-background/40 hover:bg-background/60">
                              <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
                                <img src={track.image} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayCircle className="w-14 h-14 text-primary fill-primary/20 shadow-xl rounded-full" />
                                </div>
                              </div>
                              <h3 className="font-semibold text-sm md:text-base truncate mb-1">{track.title}</h3>
                              <p className="text-xs md:text-sm text-muted-foreground truncate">{track.artist}</p>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </section>
                )
              })}
            </>
          )}
        </div>

        {/* Right Sidebar: Friends Activity */}
        <div className="hidden xl:block xl:col-span-1">
          <Card className="glass-panel sticky top-24 border-primary/10 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/50">
              <h3 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Friends Activity
              </h3>
            </div>
            <div className="p-4 space-y-6">
              {MOCK_FRIENDS.map((friend) => (
                <div key={friend.id} className="flex gap-3 group cursor-pointer">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    {friend.status === 'listening' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{friend.name}</p>
                      {friend.status === 'listening' && <Activity className="w-3 h-3 text-green-500 animate-pulse" />}
                    </div>
                    {friend.status === 'listening' ? (
                      <div className="mt-1">
                        <p className="text-xs truncate text-foreground/80">{friend.song}</p>
                        <p className="text-xs truncate text-muted-foreground">
                          <Music className="w-3 h-3 inline mr-1 opacity-50" />
                          {friend.artist}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">{friend.song}</p>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full text-xs text-muted-foreground mt-4">
                Find Friends
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
