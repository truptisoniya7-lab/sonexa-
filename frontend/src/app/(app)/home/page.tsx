'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlayCircle, Search, X, Activity, Clock, MoreHorizontal, User, Music, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const HERO_PLAYLISTS = [
  { id: 1, title: 'Midnight Memories', desc: 'Dive into the latest curated mix of synthwave and night-drive essentials. Perfect for your late-night coding sessions.', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop', uri: 'spotify:track:4u7EnebtmKWzUH433cf5Qv', artist: 'Synthwave Essentials' },
  { id: 2, title: 'Top Hits 2024', desc: 'The biggest global hits playing right now. Updated daily for your enjoyment.', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', uri: 'spotify:track:123', artist: 'Global Records' },
  { id: 3, title: 'Deep Focus', desc: 'Keep calm and focus with ambient and post-rock music. Stay in the zone.', image: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=800&auto=format&fit=crop', uri: 'spotify:track:456', artist: 'Focus Flow' }
];

export default function HomePage() {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [greeting, setGreeting] = useState('Good evening');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    CATEGORIES.forEach(async (cat) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/spotify/search?q=${encodeURIComponent(cat.query)}`);
        const tracks = await res.json();
        setCategoryData(prev => ({ ...prev, [cat.id]: Array.isArray(tracks) ? tracks : [] }));
      } catch (e) {
        console.error(`Failed to fetch ${cat.title}`, e);
        setCategoryData(prev => ({ ...prev, [cat.id]: [] }));
      }
    });

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_PLAYLISTS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/spotify/search?q=${encodeURIComponent(searchQuery)}`);
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
      const resRoom = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Private Session', host_id: 1, isPublic: 0 })
      });
      const room = await resRoom.json();

      if (room.id) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rooms/${room.id}/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song_uri: track.uri, song_title: track.title, song_artist: track.artist, song_image: track.image, added_by: 1 })
        });
        router.push(`/room/${room.id}`);
      }
    } catch (error) { console.error('Failed to start solo room', error); }
  };

  const playHeroMix = () => {
    playSong(HERO_PLAYLISTS[heroIndex]);
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
              <section className="relative overflow-hidden rounded-3xl h-72 sm:h-80 shadow-2xl group cursor-pointer border border-white/5" onClick={playHeroMix}>
                {/* Animated Gradient Background */}
                <motion.div 
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 15, ease: 'linear', repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/60 via-purple-600/40 to-blue-900/60 z-10"
                  style={{ backgroundSize: '200% 200%' }}
                />

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={heroIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 z-10"
                  >
                    <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transition-transform duration-[10000ms] ease-linear scale-110 group-hover:scale-125" style={{ backgroundImage: `url(${HERO_PLAYLISTS[heroIndex].image})` }} />
                  </motion.div>
                </AnimatePresence>

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px] z-20" />

                <div className="absolute inset-0 p-8 md:p-10 flex justify-between items-center z-30">
                  {/* Left Content */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={heroIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col justify-center h-full w-full sm:w-2/3"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),1)]" /> Featured Playlist
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">{HERO_PLAYLISTS[heroIndex].title}</h2>
                      <p className="text-white/90 max-w-lg mb-6 line-clamp-2 md:line-clamp-3 text-sm md:text-base font-medium drop-shadow-md">{HERO_PLAYLISTS[heroIndex].desc}</p>
                      <Button className="w-fit rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] group/btn overflow-hidden relative border border-white/10" onClick={(e) => { e.stopPropagation(); playHeroMix(); }}>
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative flex items-center font-bold">
                          <PlayCircle className="w-5 h-5 mr-2 group-hover/btn:scale-125 transition-transform" /> Listen Now
                        </span>
                      </Button>
                    </motion.div>
                  </AnimatePresence>

                  {/* Floating Album Artwork on the Right */}
                  <div className="hidden sm:flex w-1/3 h-full relative perspective-[1000px] items-center justify-end">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={heroIndex}
                        initial={{ opacity: 0, rotateY: 15, x: 10, y: 10 }}
                        animate={{ opacity: 1, rotateY: -10, x: 0, y: [0, -10, 0] }}
                        exit={{ opacity: 0, rotateY: -25, x: -10 }}
                        transition={{ 
                           opacity: { duration: 0.3 },
                           x: { duration: 0.3 },
                           rotateY: { duration: 0.3 },
                           y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative z-10"
                      >
                        <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 relative group-hover:border-primary/50 transition-colors duration-500 bg-black">
                           <img src={HERO_PLAYLISTS[heroIndex].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" alt="Album Art" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <PlayCircle className="w-16 h-16 text-primary drop-shadow-2xl scale-90 group-hover:scale-100 transition-transform shadow-black" />
                           </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
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
