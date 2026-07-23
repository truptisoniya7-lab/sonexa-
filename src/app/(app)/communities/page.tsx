'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Users, Globe2, X, ChevronRight, Star, Hash, Music, Play, Radio, Flame, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const CATEGORIES = [
  { name: 'Pop', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500 hover:text-white' },
  { name: 'Rock', color: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' },
  { name: 'Hip-Hop', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
  { name: 'Electronic', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500 hover:text-white' },
  { name: 'Jazz', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-white' },
  { name: 'Classical', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' },
  { name: 'Lo-Fi', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500 hover:text-white' },
];

const MOCK_COMMUNITIES = [
  { id: 1, name: "Indie Lovers", description: "Discover the best hidden indie gems before they go mainstream.", member_count: 1240, online_count: 245, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop", tags: ['Rock', 'Indie'] },
  { id: 2, name: "Lo-Fi Beats", description: "Chill beats to relax/study to. 24/7 radio and chat.", member_count: 850, online_count: 120, image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600&h=400", tags: ['Lo-Fi', 'Electronic'] },
  { id: 3, name: "K-Pop Fans", description: "All things K-Pop. Share your favorite comebacks and biases.", member_count: 3500, online_count: 890, image: "https://images.unsplash.com/photo-1493225457124-a1a2a4411138?auto=format&fit=crop&q=80&w=600&h=400", tags: ['Pop'] },
  { id: 4, name: "Synthwave City", description: "Neon lights and retro vibes. Join the 80s aesthetic.", member_count: 560, online_count: 45, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=400", tags: ['Electronic'] },
  { id: 5, name: "Acoustic Covers", description: "Share your own covers or listen to amazing acoustic talent.", member_count: 340, online_count: 12, image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600&h=400", tags: ['Acoustic', 'Pop'] },
  { id: 6, name: "Jazz Lounge", description: "Smooth jazz and classy discussions.", member_count: 920, online_count: 156, image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600&h=400", tags: ['Jazz'] },
];

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>(MOCK_COMMUNITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const createCommunity = () => {
    if (!newCommName.trim()) return;
    const newComm = {
      id: Math.random(),
      name: newCommName,
      description: newCommDesc,
      member_count: 1,
      online_count: 1,
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600&h=400",
      tags: ['New']
    };
    setCommunities([newComm, ...communities]);
    setNewCommName('');
    setNewCommDesc('');
    setShowCreate(false);
  };

  const joinCommunity = (id: number) => {
    router.push(`/communities/${id}`);
  };

  const filteredCommunities = communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Sorting based on active tab
  const getSortedCommunities = () => {
    switch (activeTab) {
      case 'newest':
        return [...filteredCommunities].reverse();
      case 'popular':
        return [...filteredCommunities].sort((a, b) => b.member_count - a.member_count);
      case 'trending':
      default:
        return [...filteredCommunities].sort((a, b) => b.online_count - a.online_count);
    }
  };

  const sortedCommunities = getSortedCommunities();
  const featured = filteredCommunities.find(c => c.id === 1) || filteredCommunities[0];

  const renderCommunityCard = (comm: any, idx: number) => (
    <motion.div
      key={comm.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="h-full"
    >
      <div className="group relative flex flex-col h-full bg-white/5 border border-white/5 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer" onClick={() => joinCommunity(comm.id)}>
        {/* Cover Image */}
        <div className="relative h-40 w-full overflow-hidden">
          <img src={comm.image} alt={comm.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          
          {/* Online Badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">{comm.online_count} online</span>
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                <ChevronRight className="w-4 h-4 text-white" />
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col relative z-10 -mt-6 bg-gradient-to-b from-transparent to-background">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1 mb-1 shadow-sm text-white drop-shadow-md">{comm.name}</h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2 flex-1">
            {comm.description || 'No description provided.'}
          </p>
          
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground font-medium bg-white/5 px-2.5 py-1 rounded-md">
              <Users className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
              {comm.member_count.toLocaleString()} Members
            </div>
            <div className="flex gap-1.5">
              {comm.tags?.map((tag: string) => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-20">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Communities</h1>
            <p className="text-lg text-muted-foreground">Find your tribe and listen together.</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-4 items-center">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search Communities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 rounded-full h-12 text-base focus-visible:ring-primary focus-visible:border-primary transition-all hover:bg-white/10 shadow-inner"
              />
            </div>
            <Button 
              onClick={() => setShowCreate(!showCreate)} 
              variant={showCreate ? "secondary" : "default"}
              className="shrink-0 rounded-full h-12 px-6 shadow-xl font-bold transition-transform hover:scale-105"
            >
              {showCreate ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {showCreate ? 'Cancel' : 'Create'}
            </Button>
          </div>
        </header>

        {/* Create Community Drawer */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <Card className="glass-panel border-primary/30 shadow-2xl shadow-primary/10 mb-8 bg-black/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Start a New Community</CardTitle>
                  <CardDescription className="text-base">Create a space for people who share your music taste.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Community Name" 
                      value={newCommName} 
                      onChange={(e) => setNewCommName(e.target.value)} 
                      className="bg-black/50 border-white/10 h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Description (What is this community about?)" 
                      rows={3} 
                      value={newCommDesc} 
                      onChange={(e) => setNewCommDesc(e.target.value)}
                      className="bg-black/50 border-white/10 resize-none text-base"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={createCommunity} disabled={!newCommName.trim()} size="lg" className="rounded-full px-8 font-bold">
                    Create Community
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          // Skeleton Loaders
          <div className="space-y-12">
            <Skeleton className="w-full h-72 rounded-3xl bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden h-[280px] flex flex-col">
                  <Skeleton className="w-full h-40 bg-white/10 rounded-none" />
                  <div className="p-5 flex-1 space-y-3">
                     <Skeleton className="w-2/3 h-6 bg-white/10" />
                     <Skeleton className="w-full h-4 bg-white/10" />
                     <Skeleton className="w-4/5 h-4 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCommunities.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-fuchsia-600/20 border border-white/10 flex items-center justify-center relative shadow-2xl backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
                <Globe2 className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 animate-bounce">
                  <Music className="w-5 h-5 text-fuchsia-300" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold mb-3">No communities found</h3>
            <p className="text-lg text-muted-foreground max-w-md mb-8">We couldn't find any communities matching your search. Why not start one yourself?</p>
            <Button onClick={() => setShowCreate(true)} size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-xl hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 mr-2" />
              Create Community
            </Button>
          </div>
        ) : (
          <>
            {/* Featured Community Banner */}
            {featured && !searchQuery && (
              <section className="relative overflow-hidden rounded-[2rem] h-[340px] shadow-2xl group cursor-pointer border border-white/10 hover:border-primary/30 transition-colors" onClick={() => joinCommunity(featured.id)}>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
                <img src={featured.image} alt={featured.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60" />
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      FEATURED
                    </div>
                    <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      {featured.online_count} Online Now
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-white drop-shadow-lg">{featured.name}</h2>
                  <p className="text-lg text-white/70 max-w-2xl mb-8 line-clamp-2">{featured.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button size="lg" className="rounded-full shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] font-bold px-8 h-14 text-base bg-white text-black hover:bg-white/90">
                      Join Community
                    </Button>
                    <span className="text-sm font-semibold text-white/50 flex items-center bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                      <Users className="w-4 h-4 mr-2" /> {featured.member_count.toLocaleString()} Total Members
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Browse by Genre / Chips */}
            {!searchQuery && (
              <section className="pt-2">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <Music className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Browse by Genre</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 snap-x">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.name} 
                      className={`snap-start whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold border transition-all duration-300 ${cat.color}`}
                    >
                      <Hash className="w-4 h-4 inline-block mr-1 opacity-70" /> 
                      {cat.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Grid Section with Tabs */}
            <section className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <Radio className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">Explore Communities</h2>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="bg-white/5 border border-white/10 rounded-full h-12 p-1">
                    <TabsTrigger value="trending" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Flame className="w-4 h-4 mr-2" /> Trending
                    </TabsTrigger>
                    <TabsTrigger value="newest" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Clock className="w-4 h-4 mr-2" /> Newest
                    </TabsTrigger>
                    <TabsTrigger value="popular" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Users className="w-4 h-4 mr-2" /> Popular
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCommunities.map((comm, idx) => renderCommunityCard(comm, idx))}
              </div>
            </section>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
